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
import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { LegendPosition } from '../../../chart/style.types';

export const legendStyleOperator: VChartRenderSpecOperator = (spec, style, config, instance) => {
    const legendStyle = style.legend;
    if (!Array.isArray(spec.legends)) {
        spec.legends = [];
    }

    const discreteLegendIndex = spec.legends.findIndex((legend) => legend.type === 'discrete');
    if (discreteLegendIndex === -1) {
        spec.legends.push({
            type: 'discrete',
            visible: legendStyle?.position !== LegendPosition.Hide,
            orient: legendStyle?.position as any,
        });
    } else {
        Tools.set(spec.legends, `${discreteLegendIndex}.visible`, legendStyle?.position !== LegendPosition.Hide);
        Tools.set(spec.legends, `${discreteLegendIndex}.orient`, legendStyle?.position);
    }

    return spec;
};
