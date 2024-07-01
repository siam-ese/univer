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
    AfterConvertOperator,
    BeforeConvertOperator,
    IChartRenderSpecConverter,
} from './types';

export class ChartRenderModel<Spec extends object = any> {
    private _renderSpecConverters = new Set<IChartRenderSpecConverter<Spec>>();
    private _beforeConvertOperators = new Set<BeforeConvertOperator>();
    private _afterConvertOperators = new Set<AfterConvertOperator<Spec>>();
    private _config: IChartConfig;

    get config() {
        return this._config;
    }

    addRenderSpecConverter(converter: IChartRenderSpecConverter<Spec>) {
        this._renderSpecConverters.add(converter);
    }

    addBeforeConvertOperator(operator: BeforeConvertOperator) {
        this._beforeConvertOperators.add(operator);
    }

    addAfterConvertOperator(operator: AfterConvertOperator<Spec>) {
        this._afterConvertOperators.add(operator);
    }

    getChartConfig(config: IChartConfig) {
        const {
            _beforeConvertOperators,
        } = this;

        // onBeforeConvert
        _beforeConvertOperators.forEach((operator) => {
            config = operator(config);
        });

        this._config = config;

        return config;
    }

    getRenderSpec(config: IChartConfig, style: ChartStyle): Spec | undefined {
        const {
            _afterConvertOperators,
            _renderSpecConverters,
        } = this;

        const converter = Array.from(_renderSpecConverters).find((converter) => converter.canConvert(config));
        if (!converter) {
            return;
        }
        // Converting
        const spec = converter.convert(config);
        // onBeforeRender
        _afterConvertOperators.forEach((operator) => operator(spec, style, config));

        return spec;
    }

    dispose() {
        this._renderSpecConverters.clear();
        this._beforeConvertOperators.clear();
        this._afterConvertOperators.clear();
    }
}
