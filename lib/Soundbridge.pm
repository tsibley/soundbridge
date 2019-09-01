use strict;
use warnings;

package Soundbridge;

use Moo;
use IO::Socket::INET;
use Method::Signatures::Simple;
use Types::Standard qw( Str InstanceOf Num Int );
use Carp qw(croak);
use Time::HiRes qw(alarm);
use namespace::clean;


our $DEFAULT_SERVER = sprintf "%s:5555", $ENV{'SOUNDBRIDGE'} || "soundbridge.local";

has server => (
    is      => 'rw',
    isa     => Str,
    default => sub { $DEFAULT_SERVER },
);

has socket => (
    is  => 'rwp',
    isa => InstanceOf['IO::Socket'],
    clearer => 1,
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

method DEMOLISH {
    $self->disconnect;
}

method connect {
    my $sock = IO::Socket::INET->new($self->server)
        or die "Unable to bind to ",$self->server,": $!";
    $self->_set_socket($sock);
    $self->debug("Connected to ", $self->server);

    my $hello = $self->socket->getline;
    croak "Huh?  Doesn't look like a Roku Soundbridge: $hello\n"
        unless $hello =~ /roku: ready/;
}

method disconnect {
    return unless $self->socket;
    $self->socket->close;
    $self->clear_socket;
    $self->debug("Disconnected from ", $self->server);
}

method get($cmd, @params) {
    $self->rcp(join " ", "Get$cmd", @params);
}

method set($cmd, @params) {
    my @results = $self->rcp(join " ", "Set$cmd", @params);

    die "Set$cmd error: $results[0]"
        unless @results and $results[0] eq "OK";

    return @results;
}

method send($text) {
    $self->rcp($_) for split /\n/, $text;
}

sub rcp {
    my $self = shift;
    my $cmd  = shift;
    my $code = shift;
    my $pre  = (split / /, $cmd, 2)[0];
    my @result;

    $self->connect unless $self->socket;
    $self->debug("==> $cmd");
    unless ($self->socket->print("$cmd\n")) {
        # Try reconnecting and sending once more
        $self->connect;
        $self->socket->print("$cmd\n")
            or die "sending to socket failed: $!";
    }

    eval {
        local $SIG{ALRM} = sub { die "TIMEOUT\n" };
        alarm $self->timeout;

        # This should all really be rewritten properly instead of an ad-hoc
        # mess.  There's a reasonable protocol here and if this used some
        # buffers and checked command markers, it'd be more robust.  That said,
        # this still works pretty well as-is.
        while ($_ = $self->socket->getline) {
            alarm 0;

            s/^\Q$pre\E:\s*//;
            s/[\r\n]//g;
            $self->debug("<-- $_");
            $code->($_) if $code;

            if (/(?:^ListResultEnd|^OK|^TransactionComplete|Error|Failed|UnknownCommand)/) {
                # Set commands should ACK an OK
                push @result, $_ if $cmd =~ /^Set/ and $_ =~ /^OK/;

                warn "$cmd: $_\n"
                    if /Error|Failed|UnknownCommand/
                   and $self->log_level;

                last;
            }
            elsif (/^ListResult/) {
                # We don't use the list start markers
                next;
            }
            elsif (/\S/) {
                push @result, $_;
            }
            elsif (/^\s*$/) {
                # Presets can be sparsely populated and we need to preserve
                # the original indexing, so don't skip blank/empty lines.
                if ($cmd eq "ListPresets")  {
                    push @result, $_;
                }
            }
        } continue {
            alarm $self->timeout;
        }
        alarm 0;
    };
    if ($@) {
        die unless $@ eq "TIMEOUT\n";
        $self->debug("Timed out reading from socket; will reconnect on next send");
        $self->disconnect;
    }
    return wantarray ? @result : \@result;
}

method debug {
    return unless $self->log_level > 1;
    warn @_, "\n";
}

1;
