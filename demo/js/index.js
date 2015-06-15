
$(document).ready(function() {
    $('#ex1').customSlider({});
    $('#ex2').customSlider({});
    $('#ex3').customSlider({});
    $('#ex4').customSlider({value: [20, 60]});
    $("#ex5").customSlider({
        ticks: [0, 100, 200, 300, 400],
        ticks_labels: ['$0', '$100', '$200', '$300', '$400'],
        ticks_snap_bounds: 30
    });
});
