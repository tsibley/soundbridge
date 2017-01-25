use strict;
use warnings;
use 5.014;

package Soundbridge::Remote;
use Moo;
extends 'Soundbridge';

use List::MoreUtils qw< firstidx >;
use namespace::clean;


sub ir_command {
    my $self = shift;
    my $cmd  = join "_", map { uc s/\s+/_/gr } @_;
    $self->rcp("IrDispatchCommand CK_$cmd");
}

sub reboot    { $_[0]->rcp('Reboot') }
sub power_off { $_[0]->rcp('SetPowerState standby') }

sub list_presets {
    my ($self) = @_;
    return $self->rcp('ListPresets');
}

sub play_pause {
    my ($self) = @_;
    $self->rcp("PlayPause");
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


1;
