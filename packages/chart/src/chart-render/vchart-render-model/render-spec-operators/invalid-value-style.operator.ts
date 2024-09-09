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

import type { VChartRenderSpecOperator } from '../vchart-render-engine';
import { defaultChartStyle } from '../../../chart/constants/default-chart-style';

export const invalidValueStyleOperator: VChartRenderSpecOperator = (_spec, style, config, instance) => {
    // if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Pie)) {
    //     hoverMarkStylizers.pie(_spec as IPieChartSpec);
    // }

    // if (chartBitsUtils.baseOn(config.type, ChartTypeBits.Column)) {
    //     hoverMarkStylizers.bar(_spec as IBarChartSpec);
    // }
    const invalidValueType = style.common?.invalidValueType;
    _spec.series?.forEach((series) => {
        switch (series.type) {
            case 'area':
            case 'line': {
                series.invalidType = invalidValueType ?? defaultChartStyle.invalidValueType;
                break;
            }
        }
    });
};
