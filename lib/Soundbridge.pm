use strict;
use warnings;

package Soundbridge;

use Moo;
use IO::Socket::INET;
use Method::Signatures::Simple;
use Types::Standard qw( Str Object Num Int );
use Carp qw(croak);
use Time::HiRes qw(alarm);
use namespace::clean;

has server => (
    is      => 'rw',
    isa     => Str,
    default => sub { 'soundbridge.local:5555' },
);

has socket => (
    is  => 'rw',
    isa => Object,
);

has timeout => (
    is  => 'rw',
    isa => Num,
    default => sub { 0.1 },
);

has log_level => (
    is  => 'rw',
    isa => Int,
    default => sub { 1 },
);

method BUILD {
    $self->connect;
    my $hello = $self->socket->getline;
    croak "Huh?  Doesn't look like a Roku Soundbridge: $hello\n"
        unless $hello =~ /roku: ready/;
}

method DEMOLISH {
    $self->disconnect;
}

method connect {
    my $sock = IO::Socket::INET->new($self->server)
        or die "Unable to bind to ",$self->server,": $!";
    $self->socket($sock);
    $self->debug("Connected to ", $self->server);
}

method disconnect {
    return unless $self->socket;
    $self->socket->close;
    $self->debug("Disconnected from ", $self->server);
}

method get($cmd, @params) {
    $self->rcp(join " ", "Get$cmd", @params);
}

method set($cmd, @params) {
    $self->rcp(join " ", "Set$cmd", @params);
}

method send($text) {
    $self->rcp($_) for split /\n/, $text;
}

sub rcp ($$;$) {
    my $self = shift;
    my $cmd  = shift;
    my $code = shift;
    my $pre  = (split / /, $cmd, 2)[0];
    my @result;

    $self->socket->print("$cmd\n");
    $self->debug("==> $cmd");

    eval {
        local $SIG{ALRM} = sub { die "TIMEOUT\n" };
        alarm $self->timeout;

        while ($_ = $self->socket->getline) {
            alarm 0;

            s/^\Q$pre\E:\s*//;
            s/[\r\n]//g;
            $self->debug("<-- $_");
            $code->($_) if $code;

            if (/(?:^ListResultEnd|^OK|^TransactionComplete|Error|Failed|UnknownCommand)/) {
                # Set commands should ACK an OK
                push @result, $_ if $cmd =~ /^Set/ and $_ eq "OK";

                warn "$cmd: $_\n"
                    if /Error|Failed|UnknownCommand/
                   and $self->log_level;

                last;
            }
            elsif (/^ListResult/) {
                # We don't use the list start/end markers
                next;
            }
            elsif (/\S/) {
                push @result, $_;
            }
        } continue {
            alarm $self->timeout;
        }
    };
    if ($@) {
        die unless $@ eq "TIMEOUT\n";
        $self->debug("Timed out reading from socket");
    }
    return wantarray ? @result : \@result;
}
sub parse (&) { $_[0] }

method debug {
    return unless $self->log_level > 1;
    warn @_, "\n";
}

1;
