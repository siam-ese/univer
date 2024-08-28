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

import type { ILegendSpec } from '@visactor/vchart/esm/component/legend';
import type { VChartRenderSpecInterceptor } from '../render-engine';
import { LegendPosition } from '../../chart/style.types';

export const legendStyleInterceptor: VChartRenderSpecInterceptor = (spec, style, config, instance) => {
    const legendStyle = style.common?.legend;
    const legend: ILegendSpec = {
        type: 'discrete',
        visible: legendStyle?.position !== LegendPosition.Hide,
        orient: legendStyle?.position as any,
    };
    spec.legends = [legend];

    return spec;
};
