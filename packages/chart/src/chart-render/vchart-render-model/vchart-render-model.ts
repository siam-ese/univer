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
import type { IChartRenderSpecConverter, RenderSpecOperator } from '../types';
import { lineConverter } from './converters/line-converter';
import { pieConverter } from './converters/pie-converter';
import { chartAxesOperator } from './render-spec-operators/chart-axes-operator';
import { chartBorderOperator } from './render-spec-operators/chart-border-operator';
import { chartBoxStyleOperator } from './render-spec-operators/chart-box-style-operator';
import { dataLabelOperator } from './render-spec-operators/data-label-operator';
import { fontSizeOperator } from './render-spec-operators/font-size-operator';
import { legendStyleOperator } from './render-spec-operators/legend-style-operator';
import { seriesStyleOperator } from './render-spec-operators/series-style-operator';
import { stackOperator } from './render-spec-operators/stack-operator';
import { titleStyleOperator } from './render-spec-operators/title-style-operator';
import type { VChartSpec } from './vchart-render-engine';
import { VChartRenderEngine } from './vchart-render-engine';

export class VChartRenderModel extends Disposable implements IChartRenderModel {
    private _specConverters: Set<IChartRenderSpecConverter<VChartSpec>> = new Set();
    private _specOperators: Set<RenderSpecOperator<VChartSpec>> = new Set();

    constructor() {
        super();
        const { _specConverters, _specOperators } = this;
        _specConverters.add(lineConverter);
        _specConverters.add(pieConverter);

        this._addSpecOperators();
    }

    private _addSpecOperators() {
        const { _specOperators } = this;

        _specOperators.add(stackOperator);
        _specOperators.add(chartBoxStyleOperator);
        _specOperators.add(fontSizeOperator);
        _specOperators.add(chartBorderOperator);
        _specOperators.add(titleStyleOperator);
        _specOperators.add(seriesStyleOperator);
        _specOperators.add(dataLabelOperator);
        _specOperators.add(legendStyleOperator);
        _specOperators.add(chartAxesOperator);
    }

    createChartInstance(): IChartInstance<VChartSpec> {
        return new VChartRenderEngine();
    }

    toSpec(chartConfig: IChartConfig) {
        const { _specConverters } = this;
        const converter = Array.from(_specConverters).find((converter) => converter.canConvert(chartConfig));

        return converter?.convert(chartConfig) || {};
    }

    stylizeSpec(spec: VChartSpec, stylizeInit: IChartRenderModelStylizeInit<VChartSpec>) {
        const { _specOperators } = this;

        const { chartStyle, chartConfig, chartInstance } = stylizeInit;
        for (const Operator of _specOperators) {
            Operator(spec, chartStyle, chartConfig, chartInstance);
        }

        return spec;
    }
}
