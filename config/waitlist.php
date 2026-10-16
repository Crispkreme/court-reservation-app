<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Claim Window
    |--------------------------------------------------------------------------
    |
    | Number of minutes a promoted member has to claim the
    | newly available booking slot.
    |
    */

    'claim_window_minutes' => env(
        'WAITLIST_CLAIM_WINDOW_MINUTES',
        10
    ),

    /*
    |--------------------------------------------------------------------------
    | Maximum Active Waitlists
    |--------------------------------------------------------------------------
    */

    'max_active_per_session' => env(
        'WAITLIST_MAX_ACTIVE_PER_SESSION',
        1
    ),

];