use strict;
use warnings;

package Soundbridge;

use Any::Moose;
use Sub::Exporter -setup => { exports => [ qw(rcp parse) ] };
use IO::Socket::INET;
use Method::Signatures;
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
}

method disconnect {
    $self->socket->close;
}

method send($text) {
    $self->rcp($_) for split /\n/, $text;
}

sub rcp ($$;$) {
    my $self = shift;
    my $cmd  = shift;
    my $code = shift;
    my $pre  = (split / /, $cmd, 2)[0];

    $self->socket->print("$cmd\n");
    while ($_ = $self->socket->getline) {
        s/^\Q$pre\E:\s*//;
        s/[\r\n]//g;
        $code->($_) if $code;
        warn "$cmd: $_\n" if /Error|UnknownCommand/;
        last if /^(?:ListResultEnd|OK|TransactionComplete|.*Error|UnknownCommand)/;
    }
}
sub parse (&) { $_[0] }

no Moose;

1;
