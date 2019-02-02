import {
  Component, AfterViewInit,
  OnChanges, ViewChild,
  ElementRef, Input, ViewEncapsulation
} from '@angular/core';

import { NodeEditor, Engine } from 'rete';
import ConnectionPlugin from 'rete-connection-plugin';
import * as VueRenderPlugin from 'rete-vue-render-plugin';
import * as ContextMenuPlugin from 'rete-context-menu-plugin';
import { NumComponent } from './components/number-component';
import { AddComponent } from './components/add-component';

@Component({
    selector: 'app-rete',
    template: '<div class="wrapper"><div #nodeEditor class="node-editor"></div></div>',
    styleUrls: ['./rete.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ReteComponent implements AfterViewInit {

  @ViewChild('nodeEditor') el: ElementRef;
  editor = null;

  async ngAfterViewInit() {
    const self = this;

    const container = this.el.nativeElement;

    const components = [new NumComponent(), new AddComponent()];

    const editor = new NodeEditor('demo@0.2.0', container);
    editor.use(ConnectionPlugin);
    editor.use(VueRenderPlugin);
    editor.use(ContextMenuPlugin);

    const engine = new Engine('demo@0.2.0');

    components.map(c => {
      editor.register(c);
      engine.register(c);
    });

    const n1 = await components[0].createNode({ num: 2 });
    const n2 = await components[0].createNode({ num: 0 });
    const add = await components[1].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);

    editor.connect(n1.outputs.get('num'), add.inputs.get('num1'));
    editor.connect(n2.outputs.get('num'), add.inputs.get('num2'));


    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      await engine.abort();
      await engine.process(editor.toJSON());
    });

    editor.view.resize();
    editor.trigger('process');
  }
}
