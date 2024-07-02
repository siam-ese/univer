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

export function addInterceptors(renderModel: ChartRenderModel) {
    renderModel.addRenderSpecInterceptor(stackInterceptor);
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

    getRenderSpec(config: IChartConfig, style: ChartStyle): Spec | undefined {
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
        _renderSpecInterceptors.forEach((interceptor) => interceptor(spec, style, config));

        return spec;
    }

    dispose() {
        this._renderSpecConverters.clear();
        this._chartConfigInterceptors.clear();
        this._renderSpecInterceptors.clear();
    }
}
