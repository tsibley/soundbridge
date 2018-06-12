#!/usr/bin/env perl
use strict;
use warnings;
use 5.020;

use FindBin qw< $Bin >;
use lib "$Bin/lib", "$Bin/local/lib/perl5";

require Soundbridge::Web;
