#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

package Soundbridge::Web;
use Web::Simple;

use FindBin qw< $Bin >;
use lib "$Bin/lib";

use Path::Tiny;
use Plack::App::File;
use Plack::Middleware::AddDefaultCharset;
use Types::Path::Tiny qw< :types >;
use Types::Standard qw< :types >;

use Soundbridge::Remote;
use constant NoContent => [ 204, [], [] ];


has sb => (
    is      => 'lazy',
    isa     => InstanceOf['Soundbridge::Remote'],
    builder => sub { Soundbridge::Remote->new },
);

has docroot => (
    is      => 'ro',
    isa     => Dir,
    default => sub { path($Bin)->child("web") },
);


sub dispatch_request {
    '' => sub {
        Plack::Middleware::AddDefaultCharset->new( charset => 'UTF-8' );
    },

	'GET + /'    => sub { redispatch_to '/index.html' },
	'GET + /...' => sub {
        Plack::App::File->new( root => $_[0]->docroot )
	},

    'POST + /play/preset/*' => 'play_preset',
    'POST + /play/remote'   => sub { $_[0]->play_preset("Remote") },

    'POST + /playpause' => sub { $_[0]->sb->play_pause; NoContent },
    'POST + /reboot'    => sub { $_[0]->sb->reboot;     NoContent },
    'POST + /power_off' => sub { $_[0]->sb->power_off;  NoContent },

    'POST + /ir/**' => sub {
        my ($self, $cmd) = @_;
        $self->sb->ir_command(split /\//, $cmd);
        NoContent;
    },
}

sub play_preset {
    my ($self, $name) = @_;

    my $preset = $self->sb->find_preset($name)
        or die "Couldn't find preset «$name»\n";

    $self->sb->play_preset( $preset->{index} );

    return NoContent;
}


__PACKAGE__->run_if_script;
