#CustomSlider

This is an implementation of slider plugin. The plugin is capable of implementing user defined horizontal sliders including Simple-Slider, normal Range-slider, Fixed-Range-Slider and Draggable-range-Slider. It also has tool-tip, label and tick functionalities. This plugin is forked and extended from bootstrap-slider [https://github.com/seiyria/bootstrap-slider authored by Kyle Kemp and Rohit Kalkur].

###Basic Setup

Load the plugin CSS and JavaScript into your web page, after loading jQuery.

###How to use?
Create an input element:

	<input id="ex1" data-slider-id='ex3Slider' type="text" data-slider-min="0" data-slider-max="20" data-slider-step="1" data-slider-value="14"/>

Invoke the plugin constructor:  

	$('#ex1').customSlider({});
  
Add custom CSS:

	#ex1Slider .slider-selection {
	background: #5E94F3;
	}
	#ex1Slider .slider-handle {
	background: #33EE1A;
	}
	#ex1Slider .slider-track-high {
	background-color: #B9D5E0;
	}
  

### Resources

    <script src="../src/js/custom-slider.js"></script>
    <link rel="styleSheet" href="../src/css/custom-slider.css">

### Dependency

    <script src="../src/lib/jquery.js"></script>
	
**Options**

Options can be passed either as a data (data-slider-foo) attribute, or as part of an object in the slider call. The only exception here is the formatter argument - that can not be passed as a data- attribute.

| Options | Type | Description          |
|---------|------|----------------------|
| id | `String` | Id for the custom-slider DOM element |
| min | `Number` | The minimum value of slider |
| max | `Number` | The maximum value of slider |
| step | `Number` | The step value of slider |
| precision | `Number` | The precision value of slider |
| value | `Number, Array` | The initial value of slider. It can be a number or an array of 2 numbers depending on slider type |
| range | `Boolean` | If true, creates a Range-Slider |
| fixed_range | `Boolean` | If true, creates a Fixed-Range-Slider. Fixed-Range-Slider is basically a range slider with its range fixed and is draggable across the slider track |
| fixed_range_value | `Number` | The value of fixed range. Combined with 'value' decides the initial position of the Fixed-Range-Slider |
| draggable_range | `Boolean` | If true, creates a Draggable-Range-Slider. Draggable-Range-Slider is basically a range slider with adjustable range and draggable selected range |
| selection | `String` | selection placement. Accepts: 'before', 'after' or 'none'. In case of a range slider, the selection will be placed between the handles |
| tooltip | `String` | whether to show the tooltip on drag, hide the tooltip, or always show the tooltip. Accepts: 'show', 'hide', or 'always' |
| tooltip_split | `Boolean` | if false show one tootip if true show two tooltips one for each handler |
| reversed | `Boolean` | whether or not the slider should be reversed |
| enabled | `Boolean` | whether or not the slider is initially enabled |
| formatter | `function` | formatter callback. Return the value wanted to be displayed in the tooltip |
| natural_arrow_keys | `Boolean` | The natural order is used for the arrow keys. Arrow right the righter slider value for a horizontal slider - no matter if the slider was reversed or not. By default the arrow keys are oriented by arrow up/right to the higher slider value, arrow down/left to the lower slider value |
| ticks | `Array` | Used to define the values of ticks. Tick marks are indicators to denote special values in the range. This option overwrites min and max options |
| ticks_positions | `Array` | Defines the positions of the tick values in percentages. The first value should always be 0, the last value should always be 100 percent |
| ticks_labels | `Array` | Defines the labels below the tick marks. Accepts HTML input |
| ticks_snap_bounds | `float` | Used to define the snap bounds of a tick. Snaps to the tick if value is within these bounds |
| focus | `Boolean` | Focus the appropriate slider handle after a value change |
