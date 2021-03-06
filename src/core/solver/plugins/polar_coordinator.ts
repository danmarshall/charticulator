// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import { Geometry, Specification, zipArray } from "../..";
import { ChartStateManager } from "../../prototypes";
import { getPointValueName } from "../../prototypes/guides/polar_coordinator";
import { PolarAttributes } from "../../prototypes/plot_segments/region_2d/polar";
import { ConstraintPlugin, ConstraintSolver, Variable } from "../abstract";

export interface PolarCoordinatorPluginOptions {}

// Converts Polar coordinates to cartesian coordinates
export class PolarCoordinatorPlugin extends ConstraintPlugin {
  public solver: ConstraintSolver;
  public cx: Variable;
  public cy: Variable;
  public an: Array<Variable>;
  attrs: PolarAttributes;
  radialVarable: Array<Variable>;
  angleVarable: Array<Variable>;
  chartConstraints: Specification.Constraint[];
  coordinatoObjectID: string;
  onUpdateAttribute: (element: string, attribute: string, value: any) => void;
  chartMananger: ChartStateManager;

  constructor(
    solver: ConstraintSolver,
    cx: Variable,
    cy: Variable,
    radialVarable: Array<Variable>,
    angleVarable: Array<Variable>,
    attrs: PolarAttributes,
    chartConstraints: Specification.Constraint[],
    coordinatoObjectID: string,
    onUpdateAttribute: (element: string, attribute: string, value: any) => void,
    chartMananger: ChartStateManager
  ) {
    super();
    this.solver = solver;
    this.cx = cx;
    this.cy = cy;
    this.radialVarable = radialVarable;
    this.angleVarable = angleVarable;
    this.attrs = attrs;
    this.chartConstraints = chartConstraints;
    this.coordinatoObjectID = coordinatoObjectID;
    this.onUpdateAttribute = onUpdateAttribute;
    this.chartMananger = chartMananger;
  }

  public apply() {
    const cx = this.solver.getValue(this.cx);
    const cy = this.solver.getValue(this.cy);

    const attrs = this.attrs;
    for (let i = 0; i < this.angleVarable.length; i++) {
      const angleAttr = this.solver.attr(
        attrs,
        (this.angleVarable[i] as any).name,
        {
          edit: false,
        }
      );

      for (let j = 0; j < this.radialVarable.length; j++) {
        const attrXname = getPointValueName(i, j, "X");
        const attrYname = getPointValueName(i, j, "Y");

        const radialAttr = this.solver.attr(
          attrs,
          (this.radialVarable[j] as any).name,
          {
            edit: false,
          }
        );

        const pointX = this.solver.attr(attrs, attrXname, {
          edit: false,
        });

        const pointY = this.solver.attr(attrs, attrYname, {
          edit: false,
        });

        const angle = this.solver.getValue(angleAttr);
        const radians = Geometry.degreesToRadians(angle);

        const radius = Math.abs(this.solver.getValue(radialAttr));
        const tx = Math.sin(radians) * radius;
        const ty = Math.cos(radians) * radius;

        this.solver.setValue(pointX, cx + tx);
        this.solver.setValue(pointY, cy + ty);

        // TODO take snapped attributes and apply new value

        this.chartConstraints
          .filter(
            (constraint) =>
              constraint.type == "snap" &&
              constraint.attributes.targetAttribute === attrXname &&
              constraint.attributes.targetElement === this.coordinatoObjectID
          )
          .forEach((constraint) => {
            // UpdateChartElementAttribute
            this.onUpdateAttribute(
              constraint.attributes.element,
              constraint.attributes.attribute,
              cx + tx
            );
          });

        this.chartConstraints
          .filter(
            (constraint) =>
              constraint.type == "snap" &&
              constraint.attributes.targetAttribute === attrYname &&
              constraint.attributes.targetElement === this.coordinatoObjectID
          )
          .forEach((constraint) => {
            // UpdateChartElementAttribute
            this.onUpdateAttribute(
              constraint.attributes.element,
              constraint.attributes.attribute,
              cy + ty
            );
          });
      }
    }
    return true;
  }
}
