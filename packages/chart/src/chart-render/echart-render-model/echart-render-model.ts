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

import { Disposable } from '@univerjs/core';
import type { IChartConfig } from '../../chart/types';
import type { IChartInstance } from '../chart-instance';
import type { IChartRenderModel, IChartRenderModelStylizeInit } from '../chart-render-model';
import type { IChartRenderSpecConverter } from '../types';
import type { ChartStyle } from '../../chart/style.types';
import { pieChartConverter } from './converters/pie-chart-converter';
import { radarChartConverter } from './converters/radar-chart-converter';
import { combinationChartConverter } from './converters/combination-chart-converter';
import {
    chartAxesOperator,
    chartBoxStyleOperator,
    chartThemeOperator,
    invalidValueStyleOperator,
    legendStyleOperator,
    lineLikeStyleOperator,
    pieStyleOperator,
    seriesStyleOperator,
    // toHorizontalOperator,
    // chartBorderOperator,
    // dataLabelOperator,
    // gradientFillOperator,
    // hoverMarkStyleOperator,
    stackOperator,
    titleStyleOperator,
} from './render-spec-operators';
import type { EChartInstance, EChartRenderSpecOperator, EChartSpec } from './echart-render-engine';
import { EChartRenderEngine } from './echart-render-engine';
import { radarStyleOperator } from './render-spec-operators/radar-style.operator';

export class EChartRenderModel extends Disposable implements IChartRenderModel {
    private _specConverters: Set<IChartRenderSpecConverter<EChartSpec>> = new Set();
    private _specOperators: Set<EChartRenderSpecOperator> = new Set();

    constructor() {
        super();

        this._addSpecConverters();
        this._addSpecOperators();
    }

    private _addSpecConverters() {
        const { _specConverters } = this;

        _specConverters.add(pieChartConverter);
        _specConverters.add(radarChartConverter);
        _specConverters.add(combinationChartConverter);
    }

    private _addSpecOperators() {
        const { _specOperators } = this;

        // _specOperators.add(toHorizontalOperator);
        _specOperators.add(stackOperator);
        _specOperators.add(chartBoxStyleOperator);
    // _specOperators.add(fontSizeOperator);
        // _specOperators.add(chartBorderOperator);
        _specOperators.add(titleStyleOperator);
        _specOperators.add(seriesStyleOperator);
        // // _specOperators.add(dataLabelOperator);
        _specOperators.add(legendStyleOperator);
        _specOperators.add(chartAxesOperator);
        // _specOperators.add(gradientFillOperator);
        _specOperators.add(lineLikeStyleOperator);
        _specOperators.add(pieStyleOperator);
        _specOperators.add(radarStyleOperator);
        // _specOperators.add(combinationStyleOperator);

        // _specOperators.add(hoverMarkStyleOperator);
        _specOperators.add(invalidValueStyleOperator);
        _specOperators.add(chartThemeOperator);
    }

    createChartInstance(): IChartInstance<EChartSpec> {
        return new EChartRenderEngine();
    }

    toSpec(config: IChartConfig, style: ChartStyle) {
        const { _specConverters } = this;
        const converter = Array.from(_specConverters).find((converter) => converter.canConvert(config));

        return converter?.convert(config, style) || {};
    }

    stylizeSpec(spec: EChartSpec, stylizeInit: IChartRenderModelStylizeInit<EChartSpec>) {
        const { _specOperators } = this;

        const { chartStyle, chartConfig, chartInstance } = stylizeInit;
        for (const operator of _specOperators) {
            operator(spec, chartStyle, chartConfig, chartInstance as EChartInstance);
        }
        // console.log('Final chart spec', spec);
        return spec;
    }
}
