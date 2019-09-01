use strict;
use warnings;
use 5.014;

package Soundbridge::Remote;
use Moo;
extends 'Soundbridge';

use List::Util qw< first >;
use List::MoreUtils qw< firstidx >;
use namespace::clean;


sub ir_command {
    my $self = shift;
    my $cmd  = join "_", map { uc s/\s+/_/gr } @_;

    # Only a very small character set is ok
    $cmd =~ s/[^A-Z0-9_]//g;

    $self->rcp("IrDispatchCommand CK_$cmd");
}

sub reboot    { $_[0]->rcp('Reboot') }
sub power_off { $_[0]->rcp('SetPowerState standby') }
sub power_on  { $_[0]->rcp('SetPowerState on') }

sub get_power {
    my $self  = shift;
    my $state = $self->rcp('GetPowerState')->[0];

    return {
        on      => "on",
        standby => "off",
    }->{$state} || $state;
}

sub current_song {
    my $self   = shift;
    my @result = $self->rcp("GetCurrentSongInfo");
    my $title  = first { s/^title: +//  } @result;
    my $artist = first { s/^artist: +// } @result;

    $title  =~ s/^\s+|\s+$//g;
    $artist =~ s/^\s+|\s+$//g;

    return undef unless $title or $artist;

    # Some stations (WXPN 🤔 ) stuff both into title and put other structured
    # info into "artist".
    ($title, $artist) = split /\s+ - \s+/x, $title, 2
        if $artist =~ /=/ or $artist =~ /^\d\d\.\d/;

    return {
        title  => $title,
        artist => $artist,
    };
}

sub list_presets {

    
    
    my ($self) = @_;
    my @result =  $self->rcp('ListPresets');

    # It would be ideal if the javascript can look up by id or index
    # rather than name so create a datastructure that has an index
    
    my @results;
    my $index = 0;

    foreach (@result) {
        push @results, {
                         name  => $_,
                         id => $index,
                        };
        $index = $index + 1 ;
    } 
    return \@results;
}

sub pause {
    my ($self) = @_;
    $self->rcp("Pause");
}

sub play_preset {
    my ($self, $index) = @_;
    $self->rcp("PlayPreset $index");
}

sub find_preset {
    my ($self, $preset) = @_;

    my @presets = $self->list_presets;
    my $index   = $preset =~ /\D/
        ? firstidx { /\Q$preset\E/i } @presets
        : $preset - 1;

    return unless $index >= 0 and $presets[$index];
    return {
        index => $index,
        name  => $presets[$index],
    };
}

sub volume {
    my ($self, $new) = @_;

    $self->set("Volume", $new + 0)
        if defined $new and $new =~ /^[0-9]+$/;

    # Fetch and return the current volume, which we may have just set.  The
    # responses to this are sometimes flaky, so try up to 3 times.  🙄
    my $attempt = 1;
    my $current;
    while (not defined $current or $attempt <= 3) {
        ($current) = $self->get("Volume");
        $attempt++;
    }

    return $current;
}

1;
