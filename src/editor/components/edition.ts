/**
 * Edition tools
 */
import { IEditionTool } from '../edition-tools/edition-tool';
import SceneTool from '../edition-tools/scene-tool';
import NodeTool from '../edition-tools/node-tool';
import LightTool from '../edition-tools/light-tool';
import PhysicsTool from '../edition-tools/physics-tool';
import RenderTargetTool from '../edition-tools/render-target-tool';
import ParticleSystemTool from '../edition-tools/particle-system-tool';
import SoundTool from '../edition-tools/sound-tool';

import AnimationTool from '../edition-tools/animation-tool';
import SkeletonTool from '../edition-tools/skeleton-tool';

import StandardMaterialTool from '../edition-tools/materials/standard-tool';
import PBRMaterialTool from '../edition-tools/materials/pbr-tool';
import WaterMaterialTool from '../edition-tools/materials/water-tool';
import CustomMaterialTool from '../edition-tools/materials/custom-tool';
import SkyMaterialTool from '../edition-tools/materials/sky-tool';
import FireMaterialTool from '../edition-tools/materials/fire-tool';
import CellMaterialTool from '../edition-tools/materials/cell-tool';
import GridMaterialTool from '../edition-tools/materials/grid-tool';
import TriPlanarMaterialTool from '../edition-tools/materials/tri-planar-tool';
import TerrainMaterialTool from '../edition-tools/materials/terrain-tool';
import LavaMaterialTool from '../edition-tools/materials/lava-tool';
import FurMaterialTool from '../edition-tools/materials/fur-tool';
import MixMaterialTool from '../edition-tools/materials/mix-tool';

import GuiImageTool from '../edition-tools/gui/image';

import PostProcessesTool from '../edition-tools/post-processes/post-processes-tool';
import PostProcessTool from '../edition-tools/post-processes/custom-tool';

import TextureTool from '../edition-tools/texture-tool';
import BrickProceduralTool from '../edition-tools/procedural-textures/brick-tool';
import CloudProceduralTool from '../edition-tools/procedural-textures/cloud-tool';
import FireProceduralTool from '../edition-tools/procedural-textures/fire-tool';
import GrassProceduralTool from '../edition-tools/procedural-textures/grass-tool';
import MarbleProceduralTool from '../edition-tools/procedural-textures/marble-tool';
import NormalProceduralTool from '../edition-tools/procedural-textures/normal-tool';
import PerlinNoiseProceduralTool from '../edition-tools/procedural-textures/perlin-tool';
import RoadProceduralTool from '../edition-tools/procedural-textures/road-tool';
import WoodProceduralTool from '../edition-tools/procedural-textures/wood-tool';

import GroundTool from '../edition-tools/meshes/ground-tool';

/**
 * Editor
 */
import Layout from '../gui/layout';

import Editor from '../editor';
import UndoRedo from '../tools/undo-redo';

export default class EditorEditionTools {
    // Public members
    public tools: IEditionTool<any>[] = [];
    public currentTools: IEditionTool<any>[] = [];
    public root: string;

    public tabs: W2UI.W2Tabs;

    public currentObject: any = null;

    // Protected members
    protected lastTabName: string = null;

    /**
     * Constructor
     * @param editor: the editor's reference
     */
    constructor(protected editor: Editor, rootDiv?: string) {
        // Configure div
        this.root = rootDiv || 'EDITION';

        // Add tabs
        // TODO: move to ../gui/tabs.ts
        this.tabs = $('#' + this.root).w2tabs({
            name: 'EDITION'
        });

        // Add tools
        this.addTool(new SceneTool());
        this.addTool(new NodeTool());
        this.addTool(new PhysicsTool());
        this.addTool(new LightTool());
        this.addTool(new RenderTargetTool());
        this.addTool(new ParticleSystemTool());
        this.addTool(new SoundTool());

        this.addTool(new AnimationTool());
        this.addTool(new SkeletonTool());
        
        this.addTool(new StandardMaterialTool());
        this.addTool(new PBRMaterialTool());
        this.addTool(new WaterMaterialTool());
        this.addTool(new CustomMaterialTool());
        this.addTool(new SkyMaterialTool());
        this.addTool(new FireMaterialTool());
        this.addTool(new CellMaterialTool());
        this.addTool(new GridMaterialTool());
        this.addTool(new TriPlanarMaterialTool());
        this.addTool(new TerrainMaterialTool());
        this.addTool(new LavaMaterialTool());
        this.addTool(new FurMaterialTool());
        this.addTool(new MixMaterialTool());

        this.addTool(new PostProcessesTool());
        this.addTool(new PostProcessTool());

        // TODO: wait for parse and serialize for GUI
        // this.addTool(new GuiImageTool());

        this.addTool(new TextureTool());
        this.addTool(new BrickProceduralTool());
        this.addTool(new CloudProceduralTool());
        this.addTool(new FireProceduralTool());
        this.addTool(new GrassProceduralTool());
        this.addTool(new MarbleProceduralTool());
        this.addTool(new NormalProceduralTool());
        this.addTool(new PerlinNoiseProceduralTool());
        this.addTool(new RoadProceduralTool());
        this.addTool(new WoodProceduralTool());

        this.addTool(new GroundTool());

        // Events
        this.editor.core.onSelectObject.add(node => this.setObject(node));
    }

    /**
     * Resizes the edition tools
     * @param width the width of the panel
     */
    public resize(width: number): void {
        this.tools.forEach(t => {
            if (t.tool && t.tool.element) {
                t.tool.element.width = width;
            }
        });
    }

    /**
     * Add the given tool (IEditionTool)
     * @param tool the tool to add
     */
    public addTool(tool: IEditionTool<any>): void {        
        let current = this.root;

        // Create container
        //$('#' + current).append('<div id="' + tool.divId + '" style="width: 100%; height: 100%"></div>');
        $('#' + current).append('<div id="' + tool.divId + '"></div>');
        $('#' + tool.divId).hide();

        // Add tab
        this.tabs.add({
            id: tool.tabName,
            caption: tool.tabName,
            closable: false,
            onClick: (event) => this.changeTab(event.target)
        });

        this.tabs.hide(tool.tabName);

        // Add & configure tool
        tool.editor = this.editor;
        this.tools.push(tool);

        // Last tab name?
        if (!this.lastTabName)
            this.lastTabName = tool.tabName;
    }

    /**
     * Sets the object to edit
     * @param object the object to edit
     */
    public setObject(object: any): void {
        this.currentTools = [];
        let firstTool: IEditionTool<any> = null;

        this.tools.forEach(t => {
            if (t.isSupported(object)) {
                // Show
                $('#' + t.divId).show();

                this.tabs.show(t.tabName);
                t.update(object);

                if (t.tabName === this.lastTabName)
                    firstTool = t;
                else if (!firstTool)
                    firstTool = t;

                // Manage undo / redo
                t.tool.onFinishChange(t.tool.element, (property, result, object, initialValue) => {
                    UndoRedo.Push({ baseObject: t.object, property: property, to: result, from: initialValue, object: object });
                });

                this.currentTools.push(t);
            } else {
                // Hide
                $('#' + t.divId).hide();
                this.tabs.hide(t.tabName);
            }
        });

        if (firstTool)
            this.changeTab(firstTool.tabName);

        // Current object
        this.currentObject = object;
    }

    /**
     * Refresh the edition tool
     */
    public refresh (): void {
        this.setObject(this.currentObject);
    }

    /**
     * Updates the display of all visible edition tools
     */
    public updateDisplay (): void {
        this.currentTools.forEach(t => t.tool.updateDisplay());
    }

    /**
     * When a tab changed
     * @param target the target tab Id
     */
    protected changeTab(target: string): void {
        this.tools.forEach(t => {
            const container = $('#' + t.divId);

            if (t.tabName === target) {
                container.show();
                this.lastTabName = target;
            }
            else
                container.hide();
        });

        // Hack hack hack, makes dat.gui working better
        window.dispatchEvent(new Event('resize'));
    }
}
