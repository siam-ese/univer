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

import type { ChartRenderModel } from '../chart-render/chart-render-model';
import { lineConverter } from '../chart-render/converters/line-converter';
import type { ChartGeneratorProvider } from '../chart/chart-generator-provider';
import { lineGenerator } from '../chart/converters/line-generator';
import { ChartType } from '../chart/types';

export interface IChartInjector {
    injectDataGenerator?(provider: ChartGeneratorProvider): void;
    injectRenderConverter?(renderModel: ChartRenderModel): void;
}

export const lineChartInjector: IChartInjector = {
    injectDataGenerator(provider) {
        provider.addGenerator(ChartType.Line, lineGenerator);
        provider.addGenerator(ChartType.Bar, lineGenerator);
    },
    injectRenderConverter(renderModel) {
        renderModel.addRenderSpecConverter(lineConverter);
    },
};

