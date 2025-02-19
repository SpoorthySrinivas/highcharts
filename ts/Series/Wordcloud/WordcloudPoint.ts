/* *
 *
 *  Experimental Highcharts module which enables visualization of a word cloud.
 *
 *  (c) 2016-2021 Highsoft AS
 *  Authors: Jon Arild Nygard
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type PolygonBoxObject from '../../Core/Renderer/PolygonBoxObject';
import type SizeObject from '../../Core/Renderer/SizeObject';
import type WordcloudPointOptions from './WordcloudPointOptions';
import type WordcloudUtils from './WordcloudUtils';

import DrawPointComposition from '../DrawPointComposition.js';
import SeriesRegistry from '../../Core/Series/SeriesRegistry.js';
const {
    seriesTypes: {
        column: ColumnSeries
    }
} = SeriesRegistry;
import U from '../../Core/Utilities.js';
const { extend } = U;
import WordcloudSeries from './WordcloudSeries';

class WordcloudPoint extends ColumnSeries.prototype.pointClass {

    /* *
     *
     * Properties
     *
     * */
    public dimensions: SizeObject = void 0 as any;
    public lastCollidedWith?: WordcloudPoint;
    public options: WordcloudPointOptions = void 0 as any;
    public polygon?: WordcloudUtils.PolygonObject = void 0 as any;
    public rect?: PolygonBoxObject = void 0 as any;
    public rotation?: (boolean|number);
    public series: WordcloudSeries = void 0 as any;

    /* *
     *
     * Functions
     *
     * */

    public isValid(): boolean {
        return true;
    }
}

/* *
 *
 *  Class Prototype
 *
 * */

interface WordcloudPoint extends DrawPointComposition.Composition {
    weight: number;
}

extend(WordcloudPoint.prototype, {
    weight: 1
});

DrawPointComposition.compose(WordcloudPoint);

/* *
 *
 *  Default Export
 *
 * */

export default WordcloudPoint;
