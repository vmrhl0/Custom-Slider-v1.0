/**
 * @classdesc This is an implementation of slider plugin. The plugin is capable of implementing user defined horizontal sliders including Simple-Slider, normal Range-slider, Fixed-Range-Slider and Draggable-range-Slider.
 * It also has tool-tip, label and tick functionalities. This plugin is forked and extended from bootstrap-slider[ https://github.com/seiyria/bootstrap-slider authored by Kyle Kemp and Rohit Kalkur ].
 *
 *
 * @class CustomSlider
 * @param {Object} options Valid options are: id, min, max, step, precision, orientation, value, range, fixed_range, fixed_range_value,
 *    draggable_range, selection, tooltip, tooltip_split, handle, reversed, enabled, formatter, natural_arrow_keys, ticks, ticks_positions, ticks_labels, ticks_snap_bounds, scale, focus
 *
 * @example
 * 
 *   HTML 
 * --------- 
 * &ltinput id="ex1" data-slider-id='ex3Slider' type="text" data-slider-min="0" data-slider-max="20" data-slider-step="1" data-slider-value="14"/&gt
 * 
 *   Javascript
 * ----------------  
 * $('#ex1').customSlider({});
 * 
 *   CSS
 * ---------
 * #ex1Slider .slider-selection {
 * background: #5E94F3;
 * }
 * #ex1Slider .slider-handle {
 * background: #33EE1A;
 * }
 * #ex1Slider .slider-track-high {
 * background-color: #B9D5E0;
 * }
 * 
 * @author Rahul V M
 * @version 1.0
 *
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2015 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function(root, factory)
{
    if (typeof define === "function" && define.amd)
    {
        define(["jquery"], factory);
    }
    else
    {
        root.CustomSlider = factory(root.jQuery);
    }

}(this, function($) {
    'use strict';
//Slider Constructor
    var CustomSlider;
//----------- Briget Plugin -------------------
    (function($) {

        'use strict';

        // -------------------------- utils -------------------------- //

        var slice = Array.prototype.slice;

        function noop() {
        }

        // -------------------------- definition -------------------------- //

        function defineBridget($) {

            // bail if no jQuery
            if (!$) {
                return;
            }

            // -------------------------- addOptionMethod -------------------------- //

            /**
             * adds option method -> $().plugin('option', {...})
             * @param {Function} PluginClass - constructor class
             */
            function addOptionMethod(PluginClass) {
                // don't overwrite original option method
                if (PluginClass.prototype.option) {
                    return;
                }

                // option setter
                PluginClass.prototype.option = function(opts) {
                    // bail out if not an object
                    if (!$.isPlainObject(opts)) {
                        return;
                    }
                    this.options = $.extend(true, this.options, opts);
                };
            }


            // -------------------------- plugin bridge -------------------------- //

            // helper function for logging errors
            // $.error breaks jQuery chaining
            var logError = typeof console === 'undefined' ? noop :
                    function(message) {
                        console.error(message);
                    };

            /**
             * jQuery plugin bridge, access methods like $elem.plugin('method')
             * @param {String} namespace - plugin name
             * @param {Function} PluginClass - constructor class
             */
            function bridge(namespace, PluginClass) {
                // add to jQuery fn namespace
                $.fn[ namespace ] = function(options) {
                    if (typeof options === 'string') {
                        // call plugin method when first argument is a string
                        // get arguments for method
                        var args = slice.call(arguments, 1);

                        for (var i = 0, len = this.length; i < len; i++) {
                            var elem = this[i];
                            var instance = $.data(elem, namespace);
                            if (!instance) {
                                logError("cannot call methods on " + namespace + " prior to initialization; " +
                                        "attempted to call '" + options + "'");
                                continue;
                            }
                            if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                                logError("no such method '" + options + "' for " + namespace + " instance");
                                continue;
                            }

                            // trigger method with arguments
                            var returnValue = instance[ options ].apply(instance, args);

                            // break look and return first value if provided
                            if (returnValue !== undefined && returnValue !== instance) {
                                return returnValue;
                            }
                        }
                        // return this if no return value
                        return this;
                    } else {
                        var objects = this.map(function() {
                            var instance = $.data(this, namespace);
                            if (instance) {
                                // apply options & init
                                instance.option(options);
                                instance._init();
                            } else {
                                // initialize new instance
                                instance = new PluginClass(this, options);
                                $.data(this, namespace, instance);
                            }
                            return $(this);
                        });

                        if (!objects || objects.length > 1) {
                            return objects;
                        } else {
                            return objects[0];
                        }
                    }
                };

            }

            // -------------------------- bridget -------------------------- //

            /**
             * converts a Prototypical class into a proper jQuery plugin
             *   the class must have a ._init method
             * @param {String} namespace - plugin name, used in $().pluginName
             * @param {Function} PluginClass - constructor class
             */
            $.bridget = function(namespace, PluginClass) {
                addOptionMethod(PluginClass);
                bridge(namespace, PluginClass);
            };

            return $.bridget;

        }

        // get jquery from browser global
        defineBridget($);

    })($);

//----------- CustomSlider Plugin ----------------------
    (function($) {
        var defaults = {
            /**
             * Id for the custom-slider DOM element.
             *
             * @kind member
             * @type {String}
             * @instance
             * @memberof CustomSlider
             */
            id: "",
            /**
             * The minimum value of slider.
             *
             * @kind member
             * @type {Number}
             * @instance
             * @memberof CustomSlider
             */
            min: 0,
            /**
             * The maximum value of slider.
             *
             * @kind member
             * @type {Number}
             * @instance
             * @memberof CustomSlider
             */
            max: 10,
            /**
             * The step value of slider.
             *
             * @kind member
             * @type {Number}
             * @instance
             * @memberof CustomSlider
             */
            step: 1,
            /**
             * The precision value of slider.
             *
             * @kind member
             * @type {Number}
             * @instance
             * @memberof CustomSlider
             */
            precision: 0,
            orientation: 'horizontal',
            /**
             * The initial value of slider. It can be a number or an array of 2 numbers depending on slider type.
             *
             * @kind member
             * @type {Number | Array}
             * @instance
             * @memberof CustomSlider
             */
            value: 5,
            /**
             * If true, creates a Range-Slider.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            range: false,
            /**
             * If true, creates a Fixed-Range-Slider. Fixed-Range-Slider is basically a range slider with its range fixed and is draggable across the slider track.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            fixed_range: false,
            /**
             * The value of fixed range. Combined with 'value' decides the initial position of the Fixed-Range-Slider.
             *
             * @kind member
             * @type {Number}
             * @instance
             * @memberof CustomSlider
             */
            fixed_range_value: 0,
            /**
             * If true, creates a Draggable-Range-Slider. Draggable-Range-Slider is basically a range slider with adjustable range and draggable selected range.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            draggable_range: false,
            /**
             * selection placement. Accepts: 'before', 'after' or 'none'. In case of a range slider, the selection will be placed between the handles.
             *
             * @kind member
             * @type {String}
             * @instance
             * @memberof CustomSlider
             */
            selection: 'before',
            /**
             * whether to show the tooltip on drag, hide the tooltip, or always show the tooltip. Accepts: 'show', 'hide', or 'always'
             *
             * @kind member
             * @type {String}
             * @instance
             * @memberof CustomSlider
             */
            tooltip: 'show',
            /**
             * if false show one tootip if true show two tooltips one for each handler.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            tooltip_split: false,
            handle: 'round',
            /**
             * whether or not the slider should be reversed.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            reversed: false,
            /**
             * whether or not the slider is initially enabled.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            enabled: true,
            /**
             * formatter callback. Return the value wanted to be displayed in the tooltip.
             *
             * @kind member
             * @type {function}
             * @instance
             * @memberof CustomSlider
             */
            formatter: function(val) {
                if (Array.isArray(val)) {
                    return val[0] + " : " + val[1];
                } else {
                    return val;
                }
            },
            /**
             * The natural order is used for the arrow keys. Arrow up select the upper slider value for vertical sliders, arrow right the righter slider value for a horizontal slider - no matter if the slider was reversed or not. By default the arrow keys are oriented by arrow up/right to the higher slider value, arrow down/left to the lower slider value.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            natural_arrow_keys: false,
            /**
             * Used to define the values of ticks. Tick marks are indicators to denote special values in the range. This option overwrites min and max options.
             *
             * @kind member
             * @type {Array}
             * @instance
             * @memberof CustomSlider
             */
            ticks: [],
            /**
             * Defines the positions of the tick values in percentages. The first value should always be 0, the last value should always be 100 percent.
             *
             * @kind member
             * @type {Array}
             * @instance
             * @memberof CustomSlider
             */
            ticks_positions: [],
            /**
             * Defines the labels below the tick marks. Accepts HTML input.
             *
             * @kind member
             * @type {Array}
             * @instance
             * @memberof CustomSlider
             */
            ticks_labels: [],
            /**
             * Used to define the snap bounds of a tick. Snaps to the tick if value is within these bounds.
             *
             * @kind member
             * @type {float}
             * @instance
             * @memberof CustomSlider
             */
            ticks_snap_bounds: 0,
            scale: 'linear',
            /**
             * Focus the appropriate slider handle after a value change.
             *
             * @kind member
             * @type {Boolean}
             * @instance
             * @memberof CustomSlider
             */
            focus: false
        };
        /**
         * Constructor function.
         *
         * @alias CustomSlider
         * @param   {Object} element             (Mandatory) Dom element
         * @param   {Object}             options (optional) object of user-defined slider parameters
         * @returns {CustomSlider}           Returns 'this' to enable method chaining
         *                                                 @see 'allowedLocation' for valid values
         */
        CustomSlider = function(element, options) {
            core.init.call(this, element, options);
            return this;
        };

        var core = {
            /**
             * Initialise the CustomSlider.
             *
             * @alias CustomSlider.core.init
             * @param   {jueryObject}  element  The input element.
             * @param   {Object}  options Configurations for the slider.
             * 
             */
            init: function(element, options) {
                if (typeof element === "string") {
                    this.element = document.querySelector(element);
                } else if (element instanceof HTMLElement) {
                    this.element = element;
                }

                /*************************************************
                 
                 Process Options
                 
                 **************************************************/
                options = options ? options : {};
                var optionTypes = Object.keys(this.defaultOptions);

                for (var i = 0; i < optionTypes.length; i++) {
                    var optName = optionTypes[i];

                    // First check if an option was passed in via the constructor
                    var val = options[optName];
                    // If no data attrib, then check data atrributes
                    val = (typeof val !== 'undefined') ? val : getDataAttrib(this.element, optName);
                    // Finally, if nothing was specified, use the defaults
                    val = (val !== null) ? val : this.defaultOptions[optName];

                    // Set all options on the instance of the Slider
                    if (!this.options) {
                        this.options = {};
                    }
                    this.options[optName] = val;
                }

                function getDataAttrib(element, optName) {
                    var dataName = "data-slider-" + optName.replace(/_/g, '-');
                    var dataValString = element.getAttribute(dataName);

                    try {
                        return JSON.parse(dataValString);
                    }
                    catch (err) {
                        return dataValString;
                    }
                }

// check if options.fixed_range is enabled
                if (this.options.fixed_range)
                    this.options.range = false;
                /*************************************************
                 
                 Create Markup
                 
                 **************************************************/

                var origWidth = this.element.style.width;
                var updateSlider = false;
                var parent = this.element.parentNode;
                var sliderTrackSelection;
                var sliderTrackLow, sliderTrackHigh;
                var sliderMinHandle;
                var sliderMaxHandle;

                if (this.sliderElem) {
                    updateSlider = true;
                } else {
                    /* Create elements needed for slider */
                    this.sliderElem = document.createElement("div");
                    this.sliderElem.className = "slider";

                    /* Create slider track elements */
                    var sliderTrack = document.createElement("div");
                    sliderTrack.className = "slider-track";

                    sliderTrackLow = document.createElement("div");
                    sliderTrackLow.className = "slider-track-low";

                    sliderTrackSelection = document.createElement("div");
                    sliderTrackSelection.className = "slider-selection";

                    sliderTrackHigh = document.createElement("div");
                    sliderTrackHigh.className = "slider-track-high";

                    sliderMinHandle = document.createElement("div");
                    sliderMinHandle.className = "slider-handle min-slider-handle";

                    sliderMaxHandle = document.createElement("div");
                    sliderMaxHandle.className = "slider-handle max-slider-handle";

                    sliderTrack.appendChild(sliderTrackLow);
                    sliderTrack.appendChild(sliderTrackSelection);
                    sliderTrack.appendChild(sliderTrackHigh);

                    /* Create ticks */
                    this.ticks = [];
                    if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
                        for (i = 0; i < this.options.ticks.length; i++) {
                            var tick = document.createElement('div');
                            tick.className = 'slider-tick';

                            this.ticks.push(tick);
                            sliderTrack.appendChild(tick);
                        }

                        sliderTrackSelection.className += " tick-slider-selection";
                    }

                    sliderTrack.appendChild(sliderMinHandle);
                    sliderTrack.appendChild(sliderMaxHandle);

                    this.tickLabels = [];
                    if (Array.isArray(this.options.ticks_labels) && this.options.ticks_labels.length > 0) {
                        this.tickLabelContainer = document.createElement('div');
                        this.tickLabelContainer.className = 'slider-tick-label-container';

                        for (i = 0; i < this.options.ticks_labels.length; i++) {
                            var label = document.createElement('div');
                            label.className = 'slider-tick-label';
                            label.innerHTML = this.options.ticks_labels[i];

                            this.tickLabels.push(label);
                            this.tickLabelContainer.appendChild(label);
                        }
                    }


                    var createAndAppendTooltipSubElements = function(tooltipElem) {
                        var arrow = document.createElement("div");
                        arrow.className = "tooltip-arrow";

                        var inner = document.createElement("div");
                        inner.className = "tooltip-inner";

                        tooltipElem.appendChild(arrow);
                        tooltipElem.appendChild(inner);

                    };

                    /* Create tooltip elements */
                    var sliderTooltip = document.createElement("div");
                    sliderTooltip.className = "tooltip tooltip-main";
                    createAndAppendTooltipSubElements(sliderTooltip);

                    var sliderTooltipMin = document.createElement("div");
                    sliderTooltipMin.className = "tooltip tooltip-min";
                    createAndAppendTooltipSubElements(sliderTooltipMin);

                    var sliderTooltipMax = document.createElement("div");
                    sliderTooltipMax.className = "tooltip tooltip-max";
                    createAndAppendTooltipSubElements(sliderTooltipMax);


                    /* Append components to sliderElem */
                    this.sliderElem.appendChild(sliderTrack);
                    this.sliderElem.appendChild(sliderTooltip);
                    this.sliderElem.appendChild(sliderTooltipMin);
                    this.sliderElem.appendChild(sliderTooltipMax);

                    if (this.tickLabelContainer) {
                        this.sliderElem.appendChild(this.tickLabelContainer);
                    }

                    /* Append slider element to parent container, right before the original <input> element */
                    parent.insertBefore(this.sliderElem, this.element);

                    /* Hide original <input> element */
                    this.element.style.display = "none";
                }
                /* If JQuery exists, cache JQ references */
                if ($) {
                    this.$element = $(this.element);
                    this.$sliderElem = $(this.sliderElem);
                }

                /*************************************************
                 
                 Setup
                 
                 **************************************************/

                this.sliderElem.id = this.options.id;

                this.tooltip = this.sliderElem.querySelector('.tooltip-main');
                this.tooltipInner = this.tooltip.querySelector('.tooltip-inner');

                this.tooltip_min = this.sliderElem.querySelector('.tooltip-min');
                this.tooltipInner_min = this.tooltip_min.querySelector('.tooltip-inner');

                this.tooltip_max = this.sliderElem.querySelector('.tooltip-max');
                this.tooltipInner_max = this.tooltip_max.querySelector('.tooltip-inner');

                if (core.SliderScale[this.options.scale]) {
                    this.options.scale = core.SliderScale[this.options.scale];
                }

                if (updateSlider === true) {
                    // Reset classes
                    core._removeClass(this.sliderElem, 'slider-horizontal');
                    core._removeClass(this.sliderElem, 'slider-vertical');
                    core._removeClass(this.tooltip, 'hide');
                    core._removeClass(this.tooltip_min, 'hide');
                    core._removeClass(this.tooltip_max, 'hide');

                    // Undo existing inline styles for track
                    ["left", "top", "width", "height"].forEach(function(prop) {
                        core._removeProperty(this.trackLow, prop);
                        core._removeProperty(this.trackSelection, prop);
                        core._removeProperty(this.trackHigh, prop);
                    }, this);

                    // Undo inline styles on handles
                    [this.handle1, this.handle2].forEach(function(handle) {
                        core._removeProperty(handle, 'left');
                        core._removeProperty(handle, 'top');
                    }, this);

                    // Undo inline styles and classes on tooltips
                    [this.tooltip, this.tooltip_min, this.tooltip_max].forEach(function(tooltip) {
                        core._removeProperty(tooltip, 'left');
                        core._removeProperty(tooltip, 'top');
                        core._removeProperty(tooltip, 'margin-left');
                        core._removeProperty(tooltip, 'margin-top');

                        core._removeClass(tooltip, 'right');
                        core._removeClass(tooltip, 'top');
                    }, this);
                }

                core._addClass(this.sliderElem, 'slider-horizontal');
                this.sliderElem.style.width = origWidth;

                this.options.orientation = 'horizontal';
                this.stylePos = 'left';
                this.mousePos = 'pageX';
                this.sizePos = 'offsetWidth';

                core._addClass(this.tooltip, 'top');
                this.tooltip.style.top = -this.tooltip.outerHeight - 14 + 'px';

                core._addClass(this.tooltip_min, 'top');
                this.tooltip_min.style.top = -this.tooltip_min.outerHeight - 14 + 'px';

                core._addClass(this.tooltip_max, 'top');
                this.tooltip_max.style.top = -this.tooltip_max.outerHeight - 14 + 'px';


                /* In case ticks are specified, overwrite the min and max bounds */
                if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
                    this.options.max = Math.max.apply(Math, this.options.ticks);
                    this.options.min = Math.min.apply(Math, this.options.ticks);
                }

                if (Array.isArray(this.options.value)) {
                    if (!this.options.fixed_range)
                    {
                        this.options.range = true;
                        this.options.fixed_range_value = 0;
                    }
                    else
                        this.options.range = false;
                } else if (this.options.range) {
                    // User wants a range, but value is not an array
                    this.options.value = [this.options.value, this.options.max];
                } else if (this.options.fixed_range) {
                    if (this.options.fixed_range_value === 0)
                        this.options.fixed_range_value = (this.options.max - this.options.min) * .25;
                    var check = (this.options.value + this.options.fixed_range_value);
                    if (check < this.options.max && check > this.options.min) {
                        this.options.value = [this.options.value, check];
                    } else {
                        this.options.value = [this.options.min, (this.options.min + this.options.fixed_range_value)];
                    }
                }

                this.trackLow = sliderTrackLow || this.trackLow;
                this.trackSelection = sliderTrackSelection || this.trackSelection;
                this.trackHigh = sliderTrackHigh || this.trackHigh;

                if (this.options.selection === 'none') {
                    core._addClass(this.trackLow, 'hide');
                    core._addClass(this.trackSelection, 'hide');
                    core._addClass(this.trackHigh, 'hide');
                }

                this.handle1 = sliderMinHandle || this.handle1;
                this.handle2 = sliderMaxHandle || this.handle2;

                if (updateSlider === true) {
                    // Reset classes
                    core._removeClass(this.handle1, 'round triangle');
                    core._removeClass(this.handle2, 'round triangle hide');

                    for (i = 0; i < this.ticks.length; i++) {
                        core._removeClass(this.ticks[i], 'round triangle hide');
                    }
                }

                var availableHandleModifiers = ['round', 'triangle', 'custom'];
                var isValidHandleType = availableHandleModifiers.indexOf(this.options.handle) !== -1;
                if (isValidHandleType) {
                    core._addClass(this.handle1, this.options.handle);
                    core._addClass(this.handle2, this.options.handle);

                    for (i = 0; i < this.ticks.length; i++) {
                        core._addClass(this.ticks[i], this.options.handle);
                    }
                }

                this.offset = core._offset.call(this, this.sliderElem);
                this.size = this.sliderElem[this.sizePos];
                core.setValue.call(this, this.options.value);

                /******************************************
                 
                 Bind Event Listeners
                 
                 ******************************************/

                // Bind keyboard handlers
                this.handle1Keydown = core._keydown.bind(this, 0);
                this.handle1.addEventListener("keydown", this.handle1Keydown, false);

                this.handle2Keydown = core._keydown.bind(this, 1);
                this.handle2.addEventListener("keydown", this.handle2Keydown, false);

                this.mousedown = core._mousedown.bind(this);
                if (this.options.draggable_range || this.options.fixed_range) {
                    this.handle1.addEventListener("mousedown", this.mousedown, false);
                    this.handle2.addEventListener("mousedown", this.mousedown, false);
                    this.trackSelection.addEventListener("mousedown", this.mousedown, false);
                } else {
                    this.sliderElem.addEventListener("mousedown", this.mousedown, false);
                }


                // Bind tooltip-related handlers
                if (this.options.tooltip === 'hide') {
                    core._addClass(this.tooltip, 'hide');
                    core._addClass(this.tooltip_min, 'hide');
                    core._addClass(this.tooltip_max, 'hide');
                } else if (this.options.tooltip === 'always') {
                    core._showTooltip.call(this);
                    core._alwaysShowTooltip = true;
                } else {
                    this.showTooltip = core._showTooltip.bind(this);
                    this.hideTooltip = core._hideTooltip.bind(this);

                    this.sliderElem.addEventListener("mouseenter", this.showTooltip, false);
                    this.sliderElem.addEventListener("mouseleave", this.hideTooltip, false);

                    this.handle1.addEventListener("focus", this.showTooltip, false);
                    this.handle1.addEventListener("blur", this.hideTooltip, false);

                    this.handle2.addEventListener("focus", this.showTooltip, false);
                    this.handle2.addEventListener("blur", this.hideTooltip, false);
                }

                if (this.options.enabled) {
                    core.enable.call(this);
                } else {
                    core.disable();
                }

            },
            /**
             * Get current value of the slider-handles.
             *
             * @alias CustomSlider.core.getValue
             * 
             * @returns {Array | Number} Current value of the slider-handle.
             */
            getValue: function() {
                if (this.options.range || this.options.fixed_range) {
                    return this.options.value;
                }
                return this.options.value[0];
            },
            /**
             * Set new value to the slider.
             *
             * @alias CustomSlider.core.setValue
             * @param   {Number | Array} val             (Mandatory) New slider-handle value(s)
             * @param   {Boolean}             triggerSlideEvent (optional) To trigger a custom slide event
             * @param   {Boolean}             triggerChangeEvent (optional) To trigger a custom change event
             * @returns {CustomSlider}           Returns 'this' to enable method chaining
             *                                                 
             */
            setValue: function(val, triggerSlideEvent, triggerChangeEvent) {
                if (!val) {
                    val = 0;
                }
                var oldValue = core.getValue.call(this);
                this.options.value = core._validateInputValue.call(this, val);
                var applyPrecision = core._applyPrecision.bind(this);

                if (this.options.range || this.options.fixed_range) {
                    this.options.value[0] = applyPrecision(this.options.value[0]);
                    this.options.value[1] = applyPrecision(this.options.value[1]);

                    this.options.value[0] = Math.max(this.options.min, Math.min(this.options.max, this.options.value[0]));
                    this.options.value[1] = Math.max(this.options.min, Math.min(this.options.max, this.options.value[1]));
                } else {
                    this.options.value = applyPrecision(this.options.value);
                    this.options.value = [Math.max(this.options.min, Math.min(this.options.max, this.options.value))];
                    core._addClass(this.handle2, 'hide');
                    if (this.options.selection === 'after') {
                        this.options.value[1] = this.options.max;
                    } else {
                        this.options.value[1] = this.options.min;
                    }
                }

                if (this.options.max > this.options.min) {
                    this.percentage = [
                        core._toPercentage.call(this, this.options.value[0]),
                        core._toPercentage.call(this, this.options.value[1]),
                        this.options.step * 100 / (this.options.max - this.options.min)
                    ];
                    this.percentage[3] = (this.percentage[1] + this.percentage[0]) / 2;
                } else {
                    this.percentage = [0, 0, 100, 0];
                }

                core._layout.call(this);
                var newValue = (this.options.range || this.options.fixed_range) ? this.options.value : this.options.value[0];

                if (triggerSlideEvent === true) {
                    core._trigger.call(this, 'slide', newValue);
                }
                if ((oldValue !== newValue) && (triggerChangeEvent === true)) {
                    core._trigger.call(this, 'change', {
                        oldValue: oldValue,
                        newValue: newValue
                    });
                }
                core._setDataVal.call(this, newValue);

                return this;
            },
            /**
             * Disable the slider.
             *
             * @alias CustomSlider.core.disable
             * 
             * @returns {CustomSlider}           Returns 'this' to enable method chaining
             *                                                 
             */
            disable: function() {
                this.options.enabled = false;
                this.handle1.removeAttribute("tabindex");
                this.handle2.removeAttribute("tabindex");
                core._addClass(this.sliderElem, 'slider-disabled');
                core._trigger.call(this, 'slideDisabled');

                return this;
            },
            /**
             * Enable the slider.
             *
             * @alias CustomSlider.core.enable
             * 
             * @returns {CustomSlider}           Returns 'this' to enable method chaining
             *                                                 
             */
            enable: function() {
                this.options.enabled = true;
                this.handle1.setAttribute("tabindex", 0);
                this.handle2.setAttribute("tabindex", 0);
                core._removeClass(this.sliderElem, 'slider-disabled');
                core._trigger.call(this, 'slideEnabled');

                return this;
            },
            /**
             * Toggle the enable or disable state of slider
             *
             * @alias CustomSlider.core.toggle
             * @returns {CustomSlider}           Returns 'this' to enable method chaining
             *                                                 
             */
            toggle: function() {
                if (this.options.enabled) {
                    core.disable(this);
                } else {
                    core.enable.call(this);
                }
                return this;
            },
            /**
             * Get the 'enabled' configuration of the slider.
             *
             * @alias CustomSlider.core.isEnabled
             * @returns {Boolean}           Returns current configuration status of 'enabled'
             *                                                 
             */
            isEnabled: function() {
                return this.options.enabled;
            },
            /**
             * Get the attribute's value
             *
             * @alias CustomSlider.core.getAttribute
             * @param   {String} attribute             (optional) The attribute's name.
             * @returns {Object | Boolean | Number | String | Array}           Returns the current configuration value of the attribute.
             *                                                 
             */
            getAttribute: function(attribute) {
                if (attribute) {
                    return this.options[attribute];
                } else {
                    return this.options;
                }
            },
            /**
             * Set the attribute's value
             *
             * @alias CustomSlider.core.setAttribute
             * @param   {String} attribute (optional) The attribute's name.
             * @param {Boolean | String | Number | Array} value Value of the attribute
             * @return {CustomSlider} Returns 'this' to enable method chaining
             *                                                 
             */
            setAttribute: function(attribute, value) {
                this.options[attribute] = value;
                return this;
            },
            /**
             * Refresh the slider.
             *
             * @alias CustomSlider.core.refresh
             * 
             * @returns {CustomSlider}           Returns 'this' to enable method chaining
             *                                                 
             */
            refresh: function() {
                core._removeSliderEventHandlers.call(this);
                core.init.call(this, core.element, this.options);
                if ($) {
                    // Bind new instance of slider to the element
                    $.data(this.element, 'slider', this);
                }
                return this;
            },
            /**
             * Removes all the event handlers associated with the slider.
             *
             * @alias CustomSlider.core._removeSliderEventHandlers
             *                                                 
             */
            _removeSliderEventHandlers: function() {
                // Remove event listeners from handle1
                this.handle1.removeEventListener("keydown", this.handle1Keydown, false);
                this.handle1.removeEventListener("focus", this.showTooltip, false);
                this.handle1.removeEventListener("blur", this.hideTooltip, false);

                // Remove event listeners from handle2
                this.handle2.removeEventListener("keydown", this.handle2Keydown, false);
                this.handle2.removeEventListener("focus", this.handle2Keydown, false);
                this.handle2.removeEventListener("blur", this.handle2Keydown, false);

                // Remove event listeners from sliderElem
                this.sliderElem.removeEventListener("mouseenter", this.showTooltip, false);
                this.sliderElem.removeEventListener("mouseleave", this.hideTooltip, false);
                this.sliderElem.removeEventListener("mousedown", this.mousedown, false);
            },
            /**
             * Displays the tool-tip
             *
             * @alias CustomSlider.core._showToolTip
             * 
             *                                                 
             */
            _showTooltip: function() {
                if (this.options.tooltip_split === false) {
                    core._addClass(this.tooltip, 'in');
                } else {
                    core._addClass(this.tooltip_min, 'in');
                    core._addClass(this.tooltip_max, 'in');
                }
                this.over = true;
            },
            /**
             * Hides the tool-tip
             *
             * @alias CustomSlider.core._hideToolTip
             * 
             *                                                 
             */
            _hideTooltip: function() {
                if (this.inDrag === false && core.alwaysShowTooltip !== true) {
                    core._removeClass(this.tooltip, 'in');
                    core._removeClass(this.tooltip_min, 'in');
                    core._removeClass(this.tooltip_max, 'in');
                }
                this.over = false;
            },
            /**
             * Modifies the layout of the slider.
             *
             * @alias CustomSlider.core._layout
             * 
             * 
             *                                                 
             */
            _layout: function() {
                var positionPercentages;
                if (this.options.reversed) {
                    positionPercentages = [100 - this.percentage[0], this.percentage[1]];
                } else {
                    positionPercentages = [this.percentage[0], this.percentage[1]];
                }
                this.handle1.style[this.stylePos] = positionPercentages[0] + '%';
                this.handle2.style[this.stylePos] = positionPercentages[1] + '%';

                /* Position ticks and labels */
                if (Array.isArray(this.options.ticks) && this.options.ticks.length > 0) {
                    var maxTickValue = Math.max.apply(Math, this.options.ticks);
                    var minTickValue = Math.min.apply(Math, this.options.ticks);
                    var styleSize = 'width';
                    var styleMargin = 'marginLeft';
                    var labelSize = this.size / (this.options.ticks.length - 1);

                    if (this.tickLabelContainer) {
                        var extraMargin = 0;
                        if (this.options.ticks_positions.length === 0) {
                            this.tickLabelContainer.style[styleMargin] = -labelSize / 2 + 'px';
                            extraMargin = this.tickLabelContainer.offsetHeight;
                        } else {
                            /* Chidren are position absolute, calculate height by finding the max offsetHeight of a child */
                            for (i = 0; i < this.tickLabelContainer.childNodes.length; i++) {
                                if (this.tickLabelContainer.childNodes[i].offsetHeight > extraMargin) {
                                    extraMargin = this.tickLabelContainer.childNodes[i].offsetHeight;
                                }
                            }
                        }
                        if (this.options.orientation === 'horizontal') {
                            this.sliderElem.style.marginBottom = extraMargin + 'px';
                        }
                    }
                    for (var i = 0; i < this.options.ticks.length; i++) {

                        var percentage = this.options.ticks_positions[i] ||
                                100 * (this.options.ticks[i] - minTickValue) / (maxTickValue - minTickValue);

                        this.ticks[i].style[this.stylePos] = percentage + '%';

                        /* Set class labels to denote whether ticks are in the selection */
                        core._removeClass(this.ticks[i], 'in-selection');
                        if (!(this.options.range || this.options.fixed_range)) {
                            if (this.options.selection === 'after' && percentage >= positionPercentages[0]) {
                                core._addClass(this.ticks[i], 'in-selection');
                            } else if (this.options.selection === 'before' && percentage <= positionPercentages[0]) {
                                core._addClass(this.ticks[i], 'in-selection');
                            }
                        } else if (percentage >= positionPercentages[0] && percentage <= positionPercentages[1]) {
                            core._addClass(this.ticks[i], 'in-selection');
                        }

                        if (this.tickLabels[i]) {
                            this.tickLabels[i].style[styleSize] = labelSize + 'px';

                            if (this.options.ticks_positions[i] !== undefined) {
                                this.tickLabels[i].style.position = 'absolute';
                                this.tickLabels[i].style[this.stylePos] = this.options.ticks_positions[i] + '%';
                                this.tickLabels[i].style[styleMargin] = -labelSize / 2 + 'px';
                            }
                        }
                    }
                }
                this.trackLow.style.left = '0';
                this.trackLow.style.width = Math.min(positionPercentages[0], positionPercentages[1]) + '%';

                this.trackSelection.style.left = Math.min(positionPercentages[0], positionPercentages[1]) + '%';
                this.trackSelection.style.width = Math.abs(positionPercentages[0] - positionPercentages[1]) + '%';

                this.trackHigh.style.right = '0';
                this.trackHigh.style.width = (100 - Math.min(positionPercentages[0], positionPercentages[1]) - Math.abs(positionPercentages[0] - positionPercentages[1])) + '%';

                var offset_min = this.tooltip_min.getBoundingClientRect();
                var offset_max = this.tooltip_max.getBoundingClientRect();

                if (offset_min.right > offset_max.left) {
                    core._removeClass(this.tooltip_max, 'top');
                    core._addClass(this.tooltip_max, 'bottom');
                    this.tooltip_max.style.top = 18 + 'px';
                } else {
                    core._removeClass(this.tooltip_max, 'bottom');
                    core._addClass(this.tooltip_max, 'top');
                    this.tooltip_max.style.top = this.tooltip_min.style.top;
                }

                var formattedTooltipVal;

                if (this.options.range || this.options.fixed_range) {
                    formattedTooltipVal = this.options.formatter(this.options.value);
                    core._setText(this.tooltipInner, formattedTooltipVal);
                    this.tooltip.style[this.stylePos] = (positionPercentages[1] + positionPercentages[0]) / 2 + '%';
                    core._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                    core._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                    var innerTooltipMinText = this.options.formatter(this.options.value[0]);
                    core._setText(this.tooltipInner_min, innerTooltipMinText);
                    var innerTooltipMaxText = this.options.formatter(this.options.value[1]);
                    core._setText(this.tooltipInner_max, innerTooltipMaxText);
                    this.tooltip_min.style[this.stylePos] = positionPercentages[0] + '%';
                    core._css(this.tooltip_min, 'margin-left', -this.tooltip_min.offsetWidth / 2 + 'px');
                    this.tooltip_max.style[this.stylePos] = positionPercentages[1] + '%';
                    core._css(this.tooltip_max, 'margin-left', -this.tooltip_max.offsetWidth / 2 + 'px');
                } else {
                    formattedTooltipVal = this.options.formatter(this.options.value[0]);
                    core._setText(this.tooltipInner, formattedTooltipVal);

                    this.tooltip.style[this.stylePos] = positionPercentages[0] + '%';
                    core._css(this.tooltip, 'margin-left', -this.tooltip.offsetWidth / 2 + 'px');
                }
            },
            /**
             * Removes the slider property.
             *
             * @alias CustomSlider.core._removeProperty
             * @param   {Object} element (Mandatory) slider DOM element.
             * @param   {String} prop (Mandatory) Property of slider element to be removed.
             *
             */
            _removeProperty: function(element, prop) {
                if (element.style.removeProperty) {
                    element.style.removeProperty(prop);
                } else {
                    element.style.removeAttribute(prop);
                }
            },
            /**
             * Custom mouse down event call back.
             *
             * @alias CustomSlider.core._mousedown
             * @param ev (Mandatory) The mousedown event.
             *
             *
             * @returns {Boolean}           Returns 'true' to denote a mouse down.
             *                                                 
             */
            _mousedown: function(ev) {
                if (!this.options.enabled) {
                    return false;
                }
                if (this.mousemove) {
                    document.removeEventListener("mousemove", this.mousemove, false);
                }
                if (this.mouseup) {
                    document.removeEventListener("mouseup", this.mouseup, false);
                }
                this.mouseup = core._mouseup.bind(this);
                document.addEventListener("mouseup", this.mouseup, false);
                var checkSliderHandleDraggableRange = (ev.target.className === this.handle1.className || ev.target.className === this.handle2.className) && this.options.draggable_range;
                var checkSliderSelectionDraggableRange = ev.target.className === "slider-selection" && this.options.draggable_range;
                var checkFixedRangeMouseMoveEnable = (ev.target.className === "slider-selection" && this.options.fixed_range) || ((ev.target.className === this.handle1.className || ev.target.className === this.handle2.className) && this.options.fixed_range);

                if (checkFixedRangeMouseMoveEnable || checkSliderHandleDraggableRange || checkSliderSelectionDraggableRange) {
                    this.mousemove = core._mousemove.bind(this);
                    document.addEventListener("mousemove", this.mousemove, false);
                } else if (!(this.options.fixed_range || this.options.draggable_range)) {
                    this.mousemove = core._mousemove.bind(this);
                    document.addEventListener("mousemove", this.mousemove, false);
                }

                this.offset = core._offset(this.sliderElem);
                this.size = this.sliderElem[this.sizePos];
                this.inDrag = true;

                var percentage = core._getPercentage.call(this, ev);

                if (this.options.range) {
                    if (checkSliderSelectionDraggableRange) {
                        this.dragged = 3;
                        this.percentage[3] = ((this.percentage[1] + this.percentage[0]) / 2);
                    }
                    else if (!this.options.draggable_range || checkSliderHandleDraggableRange) {
                        var diff1 = Math.abs(this.percentage[0] - percentage);
                        var diff2 = Math.abs(this.percentage[1] - percentage);
                        this.dragged = (diff1 < diff2) ? 0 : 1;
                    }
                }
                else if (this.options.fixed_range) {
                    this.dragged = 3;
                    this.percentage[3] = ((this.percentage[1] + this.percentage[0]) / 2);
                }
                else {
                    this.dragged = 0;
                }
                if (!this.options.fixed_range && !checkSliderSelectionDraggableRange) {
                    this.percentage[this.dragged] = this.options.reversed ? 100 - percentage : percentage;
                    core._layout.call(this);
                    var newValue = core._calculateValue.call(this);

                    core._trigger.call(this, 'slideStart', newValue);

                    core._setDataVal.call(this, newValue);
                    core.setValue.call(this, newValue, false, true);
                    if (this.options.focus) {
                        core._triggerFocusOnHandle.call(this, this.dragged);
                    }
                }
                core._pauseEvent(ev);
                return true;
            },
            /**
             * Focus the slider-handle.
             *
             * @alias CustomSlider.core._triggerFocusOnHandle
             * @param {Number} handleIdx The slider-handle to be focussed
             * 
             *                                                 
             */
            _triggerFocusOnHandle: function(handleIdx) {
                if (handleIdx === 0) {
                    this.handle1.focus();
                }
                if (handleIdx === 1) {
                    this.handle2.focus();
                }
            },
            /**
             * Custom key down event call back.
             *
             * @alias CustomSlider.core._keydown
             * @param {Number} handleIdx The selected slider-handle
             * @param ev (Mandatory) The keydown event.
             *
             *
             * @returns {Boolean}           Returns 'false' to denote a mouse down.
             *                                                 
             */
            _keydown: function(handleIdx, ev) {
                if (!this.options.enabled) {
                    return false;
                }

                var dir;
                switch (ev.keyCode) {
                    case 37: // left
                    case 40: // down
                        dir = -1;
                        break;
                    case 39: // right
                    case 38: // up
                        dir = 1;
                        break;
                }
                if (!dir) {
                    return;
                }

                // use natural arrow keys instead of from min to max
                if (this.options.natural_arrow_keys) {
                    var ifVerticalAndNotReversed = (this.options.orientation === 'vertical' && !this.options.reversed);
                    var ifHorizontalAndReversed = (this.options.orientation === 'horizontal' && this.options.reversed);

                    if (ifVerticalAndNotReversed || ifHorizontalAndReversed) {
                        dir = -dir;
                    }
                }

                var val = this.options.value[handleIdx] + dir * this.options.step;
                if (this.options.range) {
                    val = [(!handleIdx) ? val : this.options.value[0],
                        (handleIdx) ? val : this.options.value[1]];
                }

                core._trigger.call(this, 'slideStart', val);
                core._setDataVal.call(this, val);
                core.setValue.call(this, val, true, true);

                core._trigger.call(this, 'slideStop', val);
                core._setDataVal.call(this, val);
                core._layout.call(this);

                core._pauseEvent(ev);

                return false;
            },
            /**
             * Pause the event bubbling or propagation.
             *
             * @alias CustomSlider.core._pauseEvent
             * @param ev (Mandatory) The event to be paused.
             *                                                
             */
            _pauseEvent: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                }
                if (ev.preventDefault) {
                    ev.preventDefault();
                }
                ev.cancelBubble = true;
                ev.returnValue = false;
            },
            /**
             * Custom mouse move event call back.
             *
             * @alias CustomSlider.core._mousemove
             * @param ev (Mandatory) The mousemove event.
             *
             *
             * @returns {Boolean}           Returns 'false' to denote a mouse move.
             *                                                 
             */
            _mousemove: function(ev) {
                if (!this.options.enabled) {
                    return false;
                }

                var percentage = core._getPercentage.call(this, ev);
                core._adjustPercentageForRangeSliders.call(this, percentage);
                if (this.dragged === 3) {
                    var rangePercent = (this.percentage[1] - this.percentage[0]) / 2;
                    this.percentage[3] = this.options.reversed ? 100 - percentage : percentage;
                    this.percentage[0] = this.percentage[3] - rangePercent;
                    this.percentage[1] = this.percentage[3] + rangePercent;
                }

                else
                    this.percentage[this.dragged] = this.options.reversed ? 100 - percentage : percentage;
                core._layout.call(this);

                var val = core._calculateValue.call(this, true);
                core.setValue.call(this, val, true, true);

                return false;
            },
            /**
             * Adjusting the slider-handles as required in a range slider.
             *
             * @alias CustomSlider.core._adjustPercentageForRangeSliders
             * @param ev (Mandatory) The mousemove event.
             *
             *                                                 
             */
            _adjustPercentageForRangeSliders: function(percentage) {
                if (this.options.range && !this.options.fixed_range) {
                    if (this.dragged === 0 && this.percentage[1] < percentage) {
                        this.percentage[0] = this.percentage[1];
                        this.dragged = 1;
                    } else if (this.dragged === 1 && this.percentage[0] > percentage) {
                        this.percentage[1] = this.percentage[0];
                        this.dragged = 0;
                    }
                }
            },
            /**
             * Custom mouse up event call back.
             *
             * @alias CustomSlider.core._mouseup
             * 
             * @returns {Boolean}           Returns 'false' to denote a mouse move.
             *                                                 
             */
            _mouseup: function() {
                if (!this.options.enabled) {
                    return false;
                }
                // Unbind mouse event handlers:
                document.removeEventListener("mousemove", this.mousemove, false);
                document.removeEventListener("mouseup", this.mouseup, false);
                this.inDrag = false;
                if (this.over === false) {
                    core._hideTooltip.call(this);
                }
                if (!this.options.fixed_range || !(this.dragged === 3)) {
                    var val = core._calculateValue.call(this, true);
                    core._layout.call(this);
                    core._trigger.call(this, 'slideStop', val);
                    core._setDataVal.call(this, val);
                }

                return false;
            },
            /**
             * Calculate the value of the slider-handles.
             *
             * @alias CustomSlider.core._calculateValue
             * @param   {Boolean} snapToClosestTick (optional) Snap to closest tick if true.
             *
             *
             * @returns {Number | Array} Returns the calculated value of slider-handle.
             *                                                 
             */
            _calculateValue: function(snapToClosestTick) {
                var val;
                if (this.options.range) {
                    if (!(this.dragged === 3)) {
                        val = [this.options.min, this.options.max];
                        if (this.percentage[0] !== 0) {
                            val[0] = core._toValue.call(this, this.percentage[0]);
                            val[0] = core._applyPrecision.call(this, val[0]);
                        }
                        if (this.percentage[1] !== 100) {
                            val[1] = core._toValue.call(this, this.percentage[1]);
                            val[1] = core._applyPrecision.call(this, val[1]);
                        }

                    } else {
                        var currentRangePercentage = this.percentage[1] - this.percentage[0];
                        var currentRangeValue = core._toValue.call(this, currentRangePercentage);

                        val = [this.options.min, this.options.max];
                        if (this.percentage[0] !== 0) {
                            if (this.percentage[0] > (100 - currentRangePercentage)) {
                                val[0] = this.options.max - currentRangeValue;
                                val[1] = this.options.max;
                            }
                            else {
                                val[0] = core._toValue.call(this, this.percentage[0]);
                                val[0] = core._applyPrecision.call(this, val[0]);
                                val[1] = val[0] + currentRangeValue;
                                val[1] = core._applyPrecision.call(this, val[1]);
                            }
                        } else {
                            val = [this.options.min, (this.options.min + currentRangeValue)];
                        }
                    }
                } else if (this.options.fixed_range) {
                    var fixedRangePercentage = core._toPercentage.call(this, this.options.fixed_range_value);
                    val = [this.options.min, this.options.max];
                    if (this.percentage[0] !== 0) {
                        if (this.percentage[0] > (100 - fixedRangePercentage)) {
                            val[0] = this.options.max - this.options.fixed_range_value;
                        }
                        else {
                            val[0] = core._toValue.call(this, this.percentage[0]);
                            val[0] = core._applyPrecision.call(this, val[0]);
                        }
                    }
                    if (this.percentage[1] !== 100) {
                        if (this.percentage[1] < fixedRangePercentage) {
                            val[1] = this.options.min + this.options.fixed_range_value;
                        }
                        else {
                            val[1] = core._toValue.call(this, this.percentage[1]);
                            val[1] = core._applyPrecision.call(this, val[1]);
                        }
                    }
                }
                else {
                    val = core._toValue.call(this, this.percentage[0]);
                    val = parseFloat(val);
                    val = core._applyPrecision.call(this, val);
                }

                if (snapToClosestTick) {
                    var min = [val, Infinity];
                    for (var i = 0; i < this.options.ticks.length; i++) {
                        var diff = Math.abs(this.options.ticks[i] - val);
                        if (diff <= min[1]) {
                            min = [this.options.ticks[i], diff];
                        }
                    }
                    if (min[1] <= this.options.ticks_snap_bounds) {
                        return min[0];
                    }
                }

                return val;
            },
            /**
             * Get precision value from configuration and apply it to the value
             *
             * @alias CustomSlider.core._applyPrecision
             * @param {Number} val Value that needs to adjust.
             *
             *@return {function} Calls the function to adjust the value as required.                                                 
             */
            _applyPrecision: function(val) {
                var precision = this.options.precision || core._getNumDigitsAfterDecimalPlace(this.options.step);
                return core._applyToFixedAndParseFloat(val, precision);
            },
            /**
             * Get the number of decimal places.
             *
             * @alias CustomSlider.core._getNumDigitsAfterDecimalPlace
             * @param {Number} num Number to be analysed
             *
             *
             * @returns {Number} Returns the number of digits after decimal.
             *                                                 
             */
            _getNumDigitsAfterDecimalPlace: function(num) {
                var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
                if (!match) {
                    return 0;
                }
                return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
            },
            /**
             * Truncates and rounds the number to required number of decimal places.
             *
             * @alias CustomSlider.core._applyToFixedAndParseFloat
             * @param {Number} num The value to be adjusted
             * @param {Number} toFixedInput The number of decimal places
             *
             * @return {Float} Returns the resultant value
             *                                                 
             */
            _applyToFixedAndParseFloat: function(num, toFixedInput) {
                var truncatedNum = num.toFixed(toFixedInput);
                return parseFloat(truncatedNum);
            },
            /**
             * Get percentage of the slider-handle's position with repect to the min.
             *
             * @alias CustomSlider.core._getPercentage
             * @param ev The event that resulted in the slider-handle postion change
             *
             * @return {Number} Returns the percentage of slider-handle
             *                                                 
             */
            _getPercentage: function(ev) {
                var eventPosition = ev[this.mousePos];
                var sliderOffset = this.offset[this.stylePos];
                var distanceToSlide = eventPosition - sliderOffset;
                // Calculate what percent of the length the slider handle has slid
                var percentage = (distanceToSlide / this.size) * 100;
                percentage = Math.round(percentage / this.percentage[2]) * this.percentage[2];

                // Make sure the percent is within the bounds of the slider.
                // 0% corresponds to the 'min' value of the slide
                // 100% corresponds to the 'max' value of the slide
                return Math.max(0, Math.min(100, percentage));
            },
            /**
             * Check if the value is valid.
             *
             * @alias CustomSlider.core._validateInputValue
             * @param {Number | Array} val The value to be validated.
             *
             * @return {Number | Array | Error} Returns validated val or else an error message.
             *                                                 
             */
            _validateInputValue: function(val) {
                if (typeof val === 'number') {
                    return val;
                } else if (Array.isArray(val)) {
                    core._validateArray(val);
                    return val;
                } else {
                    throw new Error(core.ErrorMsgs.formatInvalidInputErrorMsg(val));
                }
            },
            /**
             * Validate the array elements.
             *
             * @alias CustomSlider.core._validateArray
             * @param {Array} val The array to be validated.
             *                                                 
             */
            _validateArray: function(val) {
                for (var i = 0; i < val.length; i++) {
                    var input = val[i];
                    if (typeof input !== 'number') {
                        throw new Error(core.ErrorMsgs.formatInvalidInputErrorMsg(input));
                    }
                }
            },
            /**
             * Set the data attribute's value.
             *
             * @alias CustomSlider.core._setDataVal
             * @param {String} val Value to be set
             *                                                 
             */
            _setDataVal: function(val) {
                var value = "value: '" + val + "'";
                this.element.setAttribute('data', value);
                this.element.setAttribute('value', val);
                this.element.value = val;
            },
            /**
             * Trigger the custom jQuery event.
             *
             * @alias CustomSlider.core._trigger
             * @param evt The event to be triggered.
             * 
             */
            _trigger: function(evt, val) {
                val = (val || val === 0) ? val : undefined;
                core._triggerJQueryEvent.call(this, evt, val);
            },
            /**
             * Trigger the custom event.
             *
             * @alias CustomSlider.core._triggerJQueryEvent
             * @param evt The event to be triggered.
             *                                                 
             */
            _triggerJQueryEvent: function(evt, val) {
                var eventData = {
                    type: evt,
                    value: val
                };
                this.$element.trigger(eventData);
                this.$sliderElem.trigger(eventData);
            },
            /**
             * Unbind custom event handlers.
             *
             * @alias CustomSlider.core._unbindJQueryEventHandlers
             * 
             */
            _unbindJQueryEventHandlers: function() {
                this.$element.off();
                this.$sliderElem.off();
            },
            /**
             * Set the tool-tip inner text.
             *
             * @alias CustomSlider.core._setText
             * @param {Object} element The tool-tip element
             * @param {String} text The text to be displayed
             *                                                 
             */
            _setText: function(element, text) {
                if (typeof element.innerText !== "undefined") {
                    element.innerText = text;
                } else if (typeof element.textContent !== "undefined") {
                    element.textContent = text;
                }
            },
            /**
             * Removes the class name from the element.
             *
             * @alias CustomSlider.core._removeClass
             * @param {Object} element The element whose class is to be removed
             * @param {String} classString The class name(s) to be removed
             *                                                 
             */
            _removeClass: function(element, classString) {
                var classes = classString.split(" ");
                var newClasses = element.className;

                for (var i = 0; i < classes.length; i++) {
                    var classTag = classes[i];
                    var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
                    newClasses = newClasses.replace(regex, " ");
                }

                element.className = newClasses.trim();
            },
            /**
             * Adds the class name to the element.
             *
             * @alias CustomSlider.core._addClass
             * @param {Object} element The element whose class name is to be modified
             * @param {String} classString The class name(s) to be added
             *                                                 
             */
            _addClass: function(element, classString) {
                var classes = classString.split(" ");
                var newClasses = element.className;

                for (var i = 0; i < classes.length; i++) {
                    var classTag = classes[i];
                    var regex = new RegExp("(?:\\s|^)" + classTag + "(?:\\s|$)");
                    var ifClassExists = regex.test(newClasses);

                    if (!ifClassExists) {
                        newClasses += " " + classTag;
                    }
                }

                element.className = newClasses.trim();
            },
            /**
             * Get the left offset
             *
             * @alias CustomSlider.core._offsetLeft
             * @param {Object} obj The element whose offset is to be determined.
             * 
             * @return {Number} Returns the offset-left of the element.
             *                                                                                                 
             */
            _offsetLeft: function(obj) {
                var offsetLeft = obj.offsetLeft;
                while ((obj = obj.offsetParent) && !isNaN(obj.offsetLeft)) {
                    offsetLeft += obj.offsetLeft;
                }
                return offsetLeft;
            },
            /**
             * Get the top offset
             *
             * @alias CustomSlider.core._offsetTop
             * @param {Object} obj The element whose offset is to be determined.
             * 
             * @return {Number} Returns the offset-top of the element.
             *                                                                                                 
             */
            _offsetTop: function(obj) {
                var offsetTop = obj.offsetTop;
                while ((obj = obj.offsetParent) && !isNaN(obj.offsetTop)) {
                    offsetTop += obj.offsetTop;
                }
                return offsetTop;
            },
            /**
             * Get the offset
             *
             * @alias CustomSlider.core._offset
             * @param {Object} obj The element whose offset is to be determined.
             * 
             * @return {Object} Returns the offset-left and offset-top of the element.
             *                                                                                                 
             */
            _offset: function(obj) {
                return {
                    left: core._offsetLeft(obj),
                    top: core._offsetTop(obj)
                };
            },
            /**
             * Modify the css property of the element.
             *
             * @alias CustomSlider.core._css
             * @param {Object} elementRef The element whose css is to be modified
             * @param {String} styleName The css property to be modified
             * @param {String} value The new value of the property
             * 
             * 
             */
            _css: function(elementRef, styleName, value) {
                if ($) {
                    $.style(elementRef, styleName, value);
                } else {
                    var style = styleName.replace(/^-ms-/, "ms-").replace(/-([\da-z])/gi, function(all, letter) {
                        return letter.toUpperCase();
                    });
                    elementRef.style[style] = value;
                }
            },
            /**
             * Convert the percentage to value of slider-scale.
             *
             * @alias CustomSlider.core._toValue
             * @param {Number} percentage The percentage value
             * 
             * @return {Number} Returns the value.
             *                                                                                                 
             */
            _toValue: function(percentage) {
                return core.SliderScale.linear.toValue.apply(this, [percentage]);
            },
            /**
             * Convert the value to percentage of slider-scale.
             *
             * @alias CustomSlider.core._toPercentage
             * @param {Number} value The value in slider_scale
             * 
             * @return {Number} Returns the percentage.
             *                                                                                                 
             */
            _toPercentage: function(value) {
                return core.SliderScale.linear.toPercentage.apply(this, [value]);
            },
            ErrorMsgs: {
                formatInvalidInputErrorMsg: function(input) {
                    return "Invalid input value '" + input + "' passed in";
                },
                callingContextNotSliderInstance: "Calling context element does not have instance of Slider bound to it. Check your code to make sure the JQuery object returned from the call to the slider() initializer is calling the method"
            },
            SliderScale: {
                linear: {
                    toValue: function(percentage) {
                        var rawValue = percentage / 100 * (this.options.max - this.options.min);
                        var value = this.options.min + Math.round(rawValue / this.options.step) * this.options.step;
                        if (value < this.options.min) {
                            return this.options.min;
                        } else if (value > this.options.max) {
                            return this.options.max;
                        } else {
                            return value;
                        }
                    },
                    toPercentage: function(value) {
                        if (this.options.max === this.options.min) {
                            return 0;
                        }
                        return 100 * (value - this.options.min) / (this.options.max - this.options.min);
                    }
                }
            }

        };


        /*************************************************
         
         INSTANCE PROPERTIES/METHODS
         
         - Any methods bound to the prototype are considered
         part of the plugin's `public` interface
         
         **************************************************/

        CustomSlider.prototype = {
            over: false,
            inDrag: false,
            _init: function() {
            }, // NOTE: Must exist to support bridget
            constructor: CustomSlider,
            defaultOptions: defaults,
            /**
             * Destroys the slider and the plugin created DOM elements and removes all associated DOM events.
             *
             * @alias CustomSlider.prototype.destroy
             * @public
             * 
             */
            destroy: function() {
                // Remove event handlers on slider elements
                core._removeSliderEventHandlers.call(this);

                // Remove the slider from the DOM
                this.sliderElem.parentNode.removeChild(this.sliderElem);
                /* Show original <input> element */
                this.element.style.display = "";

                // Remove data values
                this.element.removeAttribute("data");
                // Remove JQuery handlers/data
                if ($) {
                    core._unbindJQueryEventHandlers.call(this);
                    this.$element.removeData('slider');
                }
            }

        };
        /*********************************
         
         Attach to global namespace
         
         *********************************/
        if ($) {
            var namespace = $.fn.customSlider ? 'slider' : 'customSlider';
            $.bridget(namespace, CustomSlider);
        }

    })($);
    return CustomSlider;
}));
