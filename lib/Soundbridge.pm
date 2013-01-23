use strict;
use warnings;

package Soundbridge;

use Any::Moose;
use IO::Socket::INET;
use Method::Signatures::Simple;
use Carp qw(croak);

has server => (
    is      => 'rw',
    isa     => 'Str',
    default => 'soundbridge.local:5555',
);

has socket => (
    is  => 'rw',
    isa => 'Object',
);

has log_level => (
    is  => 'rw',
    isa => 'Int',
    default => 1,
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
    while ($_ = $self->socket->getline) {
        s/^\Q$pre\E:\s*//;
        s/[\r\n]//g;
        $code->($_) if $code;
        push @result, $_
            if not /^ListResult/ and /\S/;
        $self->debug("<-- $_");
        warn "$cmd: $_\n" if /Error|Failed|UnknownCommand/ and $self->log_level;
        last if /(?:^ListResultEnd|^OK|^TransactionComplete|Error|Failed|UnknownCommand)/;
        last if $cmd =~ /^Get/; # XXX: stops at first result line!
    }
    return wantarray ? @result : \@result;
}
sub parse (&) { $_[0] }

method debug {
    return unless $self->log_level > 1;
    warn @_, "\n";
}

Soundbridge->meta->make_immutable;
no Moose;

1;
