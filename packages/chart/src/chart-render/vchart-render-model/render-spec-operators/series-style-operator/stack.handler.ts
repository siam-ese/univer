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
import { StackType } from '../../../../chart/style.types';
import { SpecField } from '../../converters/constants';
import type { SeriesItemHandler } from './series-style-operator';

export const stackHandler: SeriesItemHandler = (series, seriesStyle, style) => {
    const stackType = style.common?.stackType;
    if (['bar', 'area'].includes(series.type)) {
        const stacked = Boolean(stackType);
        Tools.set(series, 'percent', stackType === StackType.Percent);
        Tools.set(series, 'stack', stacked);
        if (stacked) {
            Tools.set(series, 'xField', SpecField.xField);
        }
    }
};
