/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Tools } from '@univerjs/core';
import type { IBarChartSpec, IBarSeriesSpec, IPieChartSpec } from '@visactor/vchart';
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { chartBitsUtils, ChartTypeBits } from '../../../chart/constants';

const hoverMarkStylizers = {
    pie: (spec: IPieChartSpec) => {
        Tools.set(spec, 'pie.state.hover', {
            outerRadius: 0.85,
            outerBorder: {
                distance: 1,
                lineWidth: 1,
                stroke: '#4e83fd',
            },
        });
    },
    bar: (spec: IBarChartSpec | IBarSeriesSpec) => {
        Tools.set(spec, 'bar.state.hover', {
            outerBorder: {
                distance: 2,
                lineWidth: 1,
                stroke: '#4e83fd',
            },
        });
    },
};

export const hoverMarkStyleOperator: VChartRenderSpecOperator = (_spec, style, config, instance) => {
    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)) {
        hoverMarkStylizers.pie(_spec as IPieChartSpec);
    }

    if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Column)) {
        hoverMarkStylizers.bar(_spec as IBarChartSpec);
    }

    _spec.series?.forEach((series) => {
        switch (series.type) {
            case 'bar': {
                hoverMarkStylizers.bar((series as IBarSeriesSpec));
                // series
                //     .break;
                break;
            }
        }
    });
    // if (!chartBitsUtils.baseOn(config.type, ChartTypeBits.Area)) {

    // }

    // return spec;
};
