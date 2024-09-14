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

export enum AxisValueType {
    Text = 1,
    Numeric,
}

export enum IRuntimeAxisPosition {
    Left = 'left',
    Right = 'right',
    Bottom = 'bottom',
}

export enum IRuntimeAxisPriority {
    // Primary axis is the main axis always as category axis, and secondary axis is always as value axis.
    Primary = 1,
    Secondary,
    Tertiary,
}

export interface IRuntimeAxis {
    priority: IRuntimeAxisPriority;
    position: IRuntimeAxisPosition;
    type: AxisValueType;
}

export interface IChartRuntimeContext {
    themeColors: string[];
    axes: IRuntimeAxis[];
}
