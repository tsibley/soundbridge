#!/usr/bin/env perl
use strict;
use warnings;
use 5.020;
use utf8;

package Soundbridge::Web;
use Web::Simple;

use Encode qw< encode_utf8 >;
use IPC::Run qw<>;
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

has lirc_remote => (
    is      => 'ro',
    isa     => Str,
    default => 'Sony-RMT-AA400U',
);

has docroot => (
    is      => 'ro',
    isa     => Dir,
    default => sub { path(__FILE__)->parent(3)->child("web") },
);


sub Ok        ($text) { [ 200, ["Content-Type" => "text/plain"],       [encode_utf8($text)] ] }
sub Json      ($data) { [ 200, ["Content-Type" => "application/json"], [encode_json($data)] ] }
sub NoContent ()      { [ 204, [], [] ] }
sub BadRequest($text) { [ 400, ["Content-Type" => "text/plain"],       [encode_utf8($text)] ] }
sub alias     ($path) { sub { redispatch_to $path } }

sub dispatch_request {
    '' => 'default_charset',

    '/soundbridge/...' => sub {
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
    },

    '/receiver/...' => sub {
        'POST + /power'             => ir_send('power-toggle'),

        'POST + /volume/up'         => ir_send('volume-up'),
        'POST + /volume/down'       => ir_send('volume-down'),

        'POST + /input/1'           => ir_send('input-1'),
        'POST + /input/2'           => ir_send('input-2'),
        'POST + /input/3'           => ir_send('input-3'),
        'POST + /input/4'           => ir_send('input-4'),
        'POST + /input/fm'          => ir_send('input-fm'),
        'POST + /input/phono'       => ir_send('input-phono'),
        'POST + /input/bluetooth'   => ir_send('input-bluetooth'),
    },

    'GET + /'    => alias('/index.html'),
    'GET + /...' => 'serve_static',
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

sub ir_send ($key) {
    sub ($self, @) {
        return BadRequest("invalid key «$key»")
            if $key =~ /[^a-zA-Z0-9_-]/;

        run_command("irsend", "send_once", $self->lirc_remote, $key);
        return NoContent;
    }
}

sub encode_json ($data) {
    state $json = JSON::MaybeXS->new->utf8->allow_nonref;
    return $json->encode($data);
}

sub run_command (@cmd) {
    my $output;
    IPC::Run::run(\@cmd, "<", \undef, ">&", \$output)
        or die "$cmd[0] failed\nexited @{[$? >> 8]}\noutput:\n\n$output\n";
}

__PACKAGE__->run_if_script;
