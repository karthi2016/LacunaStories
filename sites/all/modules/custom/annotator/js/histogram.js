// Generated by CoffeeScript 1.11.1
(function() {
  var $,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  Annotator.Plugin.Histogram = (function(superClass) {
    extend(Histogram, superClass);

    Histogram.prototype.selector = {
      annotation: 'annotator-hl',
      hidden: 'af-annotation-hide',
      histogramID: 'annotation-histogram',
      histogramWrapperID: 'annotation-histogram-wrapper',
      bar: 'annotation-histogram-bar',
      pageTurner: 'page-turner-nav',
      pageBreak: 'page-turner-number',
      annotatorWrapper: 'annotator-wrapper'
    };

    Histogram.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      if (!Annotator.Plugin.Filters) {
        return;
      }
      if (!this.layout.horizontal) {
        return;
      }
      if (this.layout.horizontal) {
        d3.select('#' + this.layout.container).insert('svg:svg', ':first-child').append('g').attr('id', this.selector.histogramID);
      } else {
        d3.select(this.layout.container).insert('div', ':first-child').attr('id', this.selector.histogramWrapperID).append('svg:svg').append('g').attr('id', this.selector.histogramID);
      }
      this.histogramContainer = d3.select('#' + this.selector.histogramID);
      this.documentNode = $(this.annotator.wrapper).children()[1];
      this.documentNodeList = $(this.documentNode).find('.field-item.even').children();
      if (!((typeof d3 !== "undefined" && d3 !== null) || (this.d3 != null))) {
        console.error('d3.js is required to use the histogram plugin');
      } else {
        this._setupListeners();
        return this.countPageLengths();
      }
    };

    function Histogram(element, options) {
      this.update = bind(this.update, this);
      this.updateChart = bind(this.updateChart, this);
      this.updateVerticalChart = bind(this.updateVerticalChart, this);
      this.updateHorizontalChart = bind(this.updateHorizontalChart, this);
      this.setBarDimensions = bind(this.setBarDimensions, this);
      this.calculateDimensions = bind(this.calculateDimensions, this);
      this.calculateDensity = bind(this.calculateDensity, this);
      this.assignBarsPerNode = bind(this.assignBarsPerNode, this);
      this.countAnnotations = bind(this.countAnnotations, this);
      this.countAnnotation = bind(this.countAnnotation, this);
      this.getPageLength = bind(this.getPageLength, this);
      this.getPageNumber = bind(this.getPageNumber, this);
      this.getFirstPageNumber = bind(this.getFirstPageNumber, this);
      this.countPageLengths = bind(this.countPageLengths, this);
      this.hasPageBreak = bind(this.hasPageBreak, this);
      this.isPageBreak = bind(this.isPageBreak, this);
      Histogram.__super__.constructor.call(this, element, options);
      this.d3 = d3;
      this.barTextLength = 0;
      this.barsPerPage = 4;
      this.barTotal = 0;
      this.bars = [];
      this.chart;
      this.pageTurnerActive = options.page_turner.active;
      this.duration = 250;
      if (this.pageTurnerActive === true) {
        this.layout = {
          'container': 'page-turner-nav-parent',
          'horizontal': true
        };
      } else {
        this.layout = {
          'container': 'article',
          'horizontal': false,
          'width': '25'
        };
      }
    }

    Histogram.prototype._setupListeners = function() {
      var event, events, j, len;
      events = ['annotationsLoaded', 'annotationCreated', 'annotationUpdated', 'annotationDeleted'];
      for (j = 0, len = events.length; j < len; j++) {
        event = events[j];
        this.annotator.subscribe(event, this.update);
      }
      $(window).resize(this.update);
      return $(document).bind('annotation-filters-changed', this.update);
    };

    Histogram.prototype.isPageBreak = function(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return node.classList.contains(this.selector.pageBreak);
      }
      return false;
    };

    Histogram.prototype.hasPageBreak = function(node) {
      var child, j, len, ref;
      ref = node.childNodes;
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        if (this.isPageBreak(child)) {
          return true;
        }
      }
      return false;
    };

    Histogram.prototype.countPageLengths = function() {
      var j, len, length, node, ref;
      length = 0;
      this.pageLengths = {};
      ref = this.documentNodeList;
      for (j = 0, len = ref.length; j < len; j++) {
        node = ref[j];
        length += node.textContent.length;
        if (this.hasPageBreak(node)) {
          this.pageLengths[this.getPageNumber(node)] = length;
          length = 0;
        }
      }
      return this.barTextLength = this.pageLengths[this.getFirstPageNumber()] / this.barsPerPage;
    };

    Histogram.prototype.getFirstPageNumber = function() {
      var i, page, ref;
      ref = this.pageLengths;
      for (i in ref) {
        page = ref[i];
        return i;
      }
    };

    Histogram.prototype.getPageNumber = function(node) {
      var pageBreak;
      if (node.nodeType === Node.ELEMENT_NODE) {
        pageBreak = node.querySelector('.' + this.selector.pageBreak);
        if ((pageBreak != null) && (pageBreak.dataset.pageNumber != null)) {
          return parseInt(pageBreak.dataset.pageNumber, 10);
        }
        if (node.dataset.pageNumber != null) {
          return parseInt(node.dataset.pageNumber, 10);
        }
      } else {
        return null;
      }
    };

    Histogram.prototype.getPageLength = function(page) {
      if (this.pageLengths[page] != null) {
        return this.pageLengths[page];
      } else {
        return 0;
      }
    };

    Histogram.prototype.countAnnotation = function(node) {
      var id;
      if (node.classList.contains(this.selector.annotation)) {
        id = parseInt(node.dataset.annotationId, 10);
        if (indexOf.call(this.counted, id) < 0 && !node.classList.contains(this.selector.hidden)) {
          this.counted.push(id);
        }
        return true;
      }
      return false;
    };

    Histogram.prototype.countAnnotations = function(node) {
      var child, j, len, ref, results;
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.countAnnotation(node);
        if (node.hasChildNodes()) {
          ref = node.childNodes;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            child = ref[j];
            results.push(this.countAnnotations(child));
          }
          return results;
        }
      }
    };

    Histogram.prototype.assignBarsPerNode = function(node, length) {
      var child, j, len, ref, totalBars;
      if (length == null) {
        length = 0;
      }
      ref = node.childNodes;
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        length += child.textContent.length;
        if (length >= this.barTextLength && this.barTextLength > 0) {
          totalBars = Math.floor(length / this.barTextLength);
          length = length % this.barTextLength;
          if (this.counted.length > 0) {
            this.bars.push(this.counted.length);
            totalBars--;
          }
          while (totalBars--) {
            this.bars.push(0);
          }
          this.counted = [];
        }
        this.countAnnotations(child);
      }
      return length;
    };

    Histogram.prototype.calculateDensity = function(nodes) {
      var j, len, length, node, page, results;
      length = 0;
      this.counted = [];
      if (this.pageTurnerActive) {
        this.barTextLength = this.getPageLength(this.getFirstPageNumber()) / this.barsPerPage;
      }
      for (j = 0, len = nodes.length; j < len; j++) {
        node = nodes[j];
        length = this.assignBarsPerNode(node, length);
        if (this.pageTurnerActive && this.hasPageBreak(node)) {
          page = this.getPageNumber(node);
          this.barTextLength = this.getPageLength(page + 1) / this.barsPerPage;
        }
      }
      results = [];
      while (this.bars.length < this.barTotal) {
        results.push(this.bars.push(0));
      }
      return results;
    };

    Histogram.prototype.calculateDimensions = function(node) {
      this.layout.length = node.textContent.length;
      if (this.layout.horizontal) {
        this.layout.width = document.getElementById(this.layout.container).getBoundingClientRect().width;
        return this.layout.height = document.getElementById(this.selector.pageTurner).offsetHeight;
      } else {
        this.layout.height = document.getElementsByClassName(this.selector.annotatorWrapper)[0].clientHeight;
        return d3.select(this.histogramContainer[0][0].parentNode).attr('width', this.layout.width).attr('height', this.layout.height).style('float', 'left').style('padding-left', '5px').style('top', '3em');
      }
    };

    Histogram.prototype.setBarDimensions = function(length) {
      this.barTextLength = length / this.barTotal;
      if (this.layout.horizontal) {
        this.barTotal = $('.page-turner-ticks .tick').length;
        if (this.barTotal == null) {
          return this.barTotal = Math.ceil(length / this.layout.width);
        } else {
          this.pageTurnerActive = true;
          return this.barTotal = this.barTotal * this.barsPerPage;
        }
      } else {
        return this.barTotal = 20;
      }
    };

    Histogram.prototype.updateHorizontalChart = function(histogram) {
      var barWidth, height;
      barWidth = this.layout.width / this.bars.length;
      height = d3.scale.linear().domain([0, d3.max(this.bars)]).range([0, this.layout.height]);
      return histogram.attr('width', barWidth).transition().duration(this.duration).attr('height', (function(_this) {
        return function(d) {
          return height(d);
        };
      })(this)).attr('x', (function(_this) {
        return function(d, i) {
          return barWidth * i;
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.layout.height - height(d);
        };
      })(this)).style('fill', (function(_this) {
        return function(d) {
          return _this.barColors(d);
        };
      })(this));
    };

    Histogram.prototype.updateVerticalChart = function(histogram) {
      var barHeight, width;
      barHeight = this.layout.height / this.barTotal;
      width = d3.scale.linear().domain([0, d3.max(this.bars)]).range([0, this.layout.width]);
      return histogram.attr('width', (function(_this) {
        return function(d) {
          return width(d);
        };
      })(this)).transition().duration(this.duration).attr('height', barHeight).attr('x', (function(_this) {
        return function(d) {
          return _this.layout.width - width(d);
        };
      })(this)).attr('y', (function(_this) {
        return function(d, i) {
          return barHeight * i;
        };
      })(this)).style('fill', (function(_this) {
        return function(d) {
          return _this.barColors(d);
        };
      })(this));
    };

    Histogram.prototype.updateChart = function() {
      var histogram;
      this.barColors = d3.scale.linear().domain([0, d3.max(this.bars)]).range(['white', '#1693A5']);
      histogram = this.histogramContainer.selectAll("rect." + this.selector.bar).data(this.bars);
      histogram.exit().remove();
      histogram.enter().append('rect').classed(this.selector.bar, true);
      if (this.layout.horizontal) {
        return this.updateHorizontalChart(histogram);
      } else {
        return this.updateVerticalChart(histogram);
      }
    };

    Histogram.prototype.update = function() {
      if (typeof d3 === "undefined" || d3 === null) {
        return;
      }
      this.bars = [];
      this.calculateDimensions(this.documentNode);
      this.setBarDimensions(this.documentNode.textContent.length);
      this.calculateDensity(this.documentNodeList);
      return this.updateChart();
    };

    return Histogram;

  })(Annotator.Plugin);

}).call(this);
