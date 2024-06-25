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

import type { ChartType, IChartConfigGenerator } from './types';

export class ChartGeneratorProvider {
    private _generators = new Map<ChartType, IChartConfigGenerator>();

    addGenerator(name: ChartType, generator: IChartConfigGenerator) {
        const { _generators } = this;
        if (_generators.has(name)) {
            console.warn(`The type of ${name} chart generator has been registered!`);
            return;
        }
        _generators.set(name, generator);
    }

    getGenerator(type: ChartType) {
        return this._generators.get(type);
    }
}

