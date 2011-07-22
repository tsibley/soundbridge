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

method send($text) {
    $self->rcp($_) for split /\n/, $text;
}

sub rcp ($$;$) {
    my $self = shift;
    my $cmd  = shift;
    my $code = shift;
    my $pre  = (split / /, $cmd, 2)[0];

    $self->socket->print("$cmd\n");
    $self->debug("==> $cmd");
    while ($_ = $self->socket->getline) {
        s/^\Q$pre\E:\s*//;
        s/[\r\n]//g;
        $code->($_) if $code;
        $self->debug("<-- $_");
        warn "$cmd: $_\n" if /Error|Failed|UnknownCommand/ and $self->log_level;
        last if /(?:^ListResultEnd|^OK|^TransactionComplete|Error|Failed|UnknownCommand)/;
    }
}
sub parse (&) { $_[0] }

method debug {
    return unless $self->log_level > 1;
    warn @_, "\n";
}

no Moose;

1;
