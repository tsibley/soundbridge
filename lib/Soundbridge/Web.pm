#!/usr/bin/env perl
use strict;
use warnings;
use 5.020;
use utf8;

package Soundbridge::Web;
use Web::Simple;

use Encode qw< encode_utf8 >;
use JSON::MaybeXS qw<>;
use Path::Tiny;
use Plack::App::File;
use Plack::Middleware::AddDefaultCharset;
use Types::Path::Tiny qw< :types >;
use Types::Standard qw< :types >;

use Soundbridge::Remote;
use experimental qw< signatures >;


has sb => (
    is      => 'lazy',
    isa     => InstanceOf['Soundbridge::Remote'],
    builder => sub { Soundbridge::Remote->new( timeout => 0.2 ) },
);

has docroot => (
    is      => 'ro',
    isa     => Dir,
    default => sub { path(__FILE__)->parent(3)->child("web") },
);


sub Ok        ($text) { [ 200, ["Content-Type" => "text/plain"],       [encode_utf8($text)] ] }
sub Json      ($data) { [ 200, ["Content-Type" => "application/json"], [encode_json($data)] ] }
sub NoContent ()      { [ 204, [], [] ] }
sub alias     ($path) { sub { redispatch_to $path } }

sub dispatch_request {
    '' => 'default_charset',

    'GET  + /state'         => 'state',
    'GET  + /current-song'  => 'current_song',

    'GET  + /presets'       => 'list_presets',
    'POST + /play/preset/*' => 'play_preset',
    'POST + /pause'         => 'pause',

    'GET  + /volume'        => 'get_volume',
    'POST + /volume/*'      => 'set_volume',

    'GET  + /power'         => 'get_power',
    'POST + /power'         => alias('/ir/power'),
    'POST + /reboot'        => 'reboot',

    # I didn't debug why, but this line must be after the POST + /power line
    # above or the redispatch won't work (404 will be returned).
    #   -trs, 19 Jan 2018
    'POST + /ir/**'         => 'ir_command',

	'GET + /'               => alias('/index.html'),
	'GET + /...'            => 'serve_static',
}

sub default_charset ($self, @) {
    Plack::Middleware::AddDefaultCharset->new( charset => 'UTF-8' );
}

sub serve_static ($self, @) {
    Plack::App::File->new( root => $self->docroot );
}

sub state ($self, @) {
    my $power = $self->sb->get_power;

    Json {
        power => $power,

        volume => $power eq 'on'
            ? $self->sb->volume + 0
            : 0,

        currentSong => $power eq 'on'
            ? $self->sb->current_song
            : undef,
    };
}

sub current_song ($self, @) {
    Json $self->sb->current_song;
}

sub list_presets($self, @) {
    Json [ $self->sb->list_presets ];
}

sub get_volume ($self, @) {
    Ok $self->sb->volume;
}

sub set_volume ($self, $to, @) {
    Ok $self->sb->volume($to);
}

sub play_preset ($self, $index, @) {
    $self->sb->play_preset($index);
    return NoContent;
}

sub pause ($self, @) {
    $self->sb->pause;
    return NoContent;
}

sub ir_command ($self, $cmd, @) {
    $self->sb->ir_command(split /\//, $cmd);
    return NoContent;
}

sub get_power ($self, @) {
    Ok $self->sb->get_power;
}

sub reboot ($self, @) {
    $self->sb->reboot;
    return NoContent;
}

sub encode_json ($data) {
    state $json = JSON::MaybeXS->new->utf8->allow_nonref;
    return $json->encode($data);
}

__PACKAGE__->run_if_script;
