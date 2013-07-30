var visible;
visible = false;

$(document).ready(function() {
    $("#info a").click(function () {
            if (visible===false) {
              $('#infobox').show("slide", { direction: "right" }, 500).css('z-index', 0);
              $('#controlsbox').css('border-left', '1px solid #1A1A1A').css('z-index', 1);
            } else {
              $('#infobox').css('z-index', -1).hide("slide", { direction: "right" }, 500);                                     
              $('#controlsbox').css('border-left', '0px solid #1A1A1A').css('z-index', 0);
            }
            visible = !visible;
    });
    function closeinfo() {
        if (visible===true) {
            $('#infobox').hide("slide", { direction: "right" }, 500);
            $('#controlsbox').css('border-left', '0px solid #1A1A1A');
            visible = false;
        }
    }
    $('#nextslide').click(closeinfo);
    $('#prevslide').click(closeinfo);
                            
    jQuery(function($){
        $.supersized({
        // Functionality
        slideshow               :   1,                  // Slideshow on/off
        autoplay                                :       0,                      // Slideshow starts playing automatically
        start_slide             :   1,                  // Start slide (0 is random)
        stop_loop                               :       0,                      // Pauses slideshow on last slide
        random                                  :       0,                      // Randomize slide order (Ignores start slide)
        slide_interval          :   3000,               // Length between transitions
        transition              :   1,                  // 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
        transition_speed                :       1000,           // Speed of transition
        new_window                              :       1,                      // Image links open in new window/tab
        pause_hover             :   0,                  // Pause slideshow on hover
        keyboard_nav            :   1,                  // Keyboard navigation on/off
        performance                             :       2,                      // 0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)
        image_protect                   :       0,                      // Disables image dragging and right click with Javascript
                                                                                           
        // Size & Position                                                 
        min_width                       :   1024,                       // Min width allowed (in pixels)
        min_height                      :   768,                        // Min height allowed (in pixels)
        vertical_center         :   1,                  // Vertically center background
        horizontal_center       :   1,                  // Horizontally center background
        fit_always                              :       0,                      // Image will never exceed browser width or height (Ignores min. dimensions)
        fit_portrait            :   0,                  // Portrait images will not exceed browser height
        fit_landscape                   :   0,                  // Landscape images will not exceed browser width
                                                                                           
        // Components                                                   
        slide_links                             :       'false',        // Individual links for each slide (Options: false, 'number', 'name', 'blank')
        thumb_links                             :       0,                      // Individual thumb links for each slide
        thumbnail_navigation    :   0,                  // Thumbnail navigation
        slides                                  :       slidedata,                                                                                              
        // Theme Options                           
        progress_bar                    :       1,                      // Timer for each slide                                                 
        mouse_scrub                             :       0,
        image_path                              :   '_design/img/',
        });
    });                 
});
