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

import type { IChartConfig } from '../chart/types';
import type { ChartStyle } from '../chart/style.types';
import type {
    ChartConfigInterceptor,
    IChartRenderSpecConverter,
    RenderSpecInterceptor,
} from './types';
import { stackInterceptor } from './render-spec-interceptors/stack-interceptor';
import { chartBoxStyleInterceptor } from './render-spec-interceptors/chart-box-style-interceptor';
import { fontSizeInterceptor } from './render-spec-interceptors/font-size-interceptor';
import { chartBorderInterceptor } from './render-spec-interceptors/chart-border-interceptor';
import type { IChartRenderEngine } from './render-engine';
import { titleStyleInterceptor } from './render-spec-interceptors/title-style-interceptor';
import { seriesStyleInterceptor } from './render-spec-interceptors/series-style-interceptor';
import { dataLabelInterceptor } from './render-spec-interceptors/data-label-interceptor';
import { legendStyleInterceptor } from './render-spec-interceptors/legend-style-interceptor';
import { chartAxesInterceptor } from './render-spec-interceptors/chart-axes-interceptor';

export function addInterceptors(renderModel: ChartRenderModel) {
    renderModel.addRenderSpecInterceptor(stackInterceptor);
    renderModel.addRenderSpecInterceptor(chartBoxStyleInterceptor);
    renderModel.addRenderSpecInterceptor(fontSizeInterceptor);
    renderModel.addRenderSpecInterceptor(chartBorderInterceptor);
    renderModel.addRenderSpecInterceptor(titleStyleInterceptor);
    renderModel.addRenderSpecInterceptor(seriesStyleInterceptor);
    renderModel.addRenderSpecInterceptor(dataLabelInterceptor);
    renderModel.addRenderSpecInterceptor(legendStyleInterceptor);
    renderModel.addRenderSpecInterceptor(chartAxesInterceptor);
}

export class ChartRenderModel<Spec extends object = any> {
    private _renderSpecConverters = new Set<IChartRenderSpecConverter<Spec>>();
    private _chartConfigInterceptors = new Set<ChartConfigInterceptor>();
    private _renderSpecInterceptors = new Set<RenderSpecInterceptor<Spec>>();
    private _config: IChartConfig;

    get config() {
        return this._config;
    }

    addRenderSpecConverter(converter: IChartRenderSpecConverter<Spec>) {
        this._renderSpecConverters.add(converter);
    }

    addChartConfigInterceptor(operator: ChartConfigInterceptor) {
        this._chartConfigInterceptors.add(operator);
    }

    addRenderSpecInterceptor(operator: RenderSpecInterceptor<Spec>) {
        this._renderSpecInterceptors.add(operator);
    }

    getChartConfig(config: IChartConfig) {
        const {
            _chartConfigInterceptors,
        } = this;

        // onBeforeConvert
        _chartConfigInterceptors.forEach((interceptor) => {
            config = interceptor(config);
        });

        this._config = config;

        return config;
    }

    getRenderSpec(config: IChartConfig, style: ChartStyle, renderEngine: IChartRenderEngine): Spec | undefined {
        const {
            _renderSpecInterceptors,
            _renderSpecConverters,
        } = this;

        const converter = Array.from(_renderSpecConverters).find((converter) => converter.canConvert(config));
        if (!converter) {
            return;
        }
        // Converting
        const spec = converter.convert(config);
        // onBeforeRender
        _renderSpecInterceptors.forEach((interceptor) => interceptor(spec, style, config, renderEngine));
        // console.log('Final spec', spec);
        return spec;
    }

    dispose() {
        this._renderSpecConverters.clear();
        this._chartConfigInterceptors.clear();
        this._renderSpecInterceptors.clear();
    }
}
