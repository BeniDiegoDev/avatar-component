/// <reference types="jest" />
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { AvatarController } from '../components/avatar-controller';
import '../components/avatar-controller';

describe('<avatar-controller>', () => {
    let el: AvatarController;

    beforeAll(() => {
        // 1) Stub de initScene pour éviter WebGL (comme vous aviez déjà fait)
        // @ts-ignore
        (AvatarController.prototype as any).initScene = async function () {
            this.loading = false;
            await this.updateComplete;
        };
        // 2) Stub de la méthode privée play pour qu’elle émette start+end direct
        // @ts-ignore
        (AvatarController.prototype as any).play = function (name: string) {
            this.dispatchEvent(new CustomEvent('animation-start', { detail: name }));
            this.dispatchEvent(new CustomEvent('animation-end',   { detail: name }));
        };
    });

    beforeEach(async () => {
        // 3) On crée l’élément une fois les stubs en place
        el = await fixture<AvatarController>(html`
      <avatar-controller
        src="/models/avatar.glb"
        width="200"
        height="200"
        autoplay="false"
      ></avatar-controller>
    `);
        await el.updateComplete;
    });

    it(
        'émet animation-start puis animation-end au clic sur "Saluer"',
        async () => {
            // Repère le bouton via son texte
            const btn = Array.from(
                el.shadowRoot!.querySelectorAll('button')
            ).find(b => b.textContent?.trim() === 'Saluer')! as HTMLButtonElement;

            // prépare les promesses AVANT le click
            const startP = oneEvent(el, 'animation-start');
            const endP   = oneEvent(el, 'animation-end');

            // déclenche
            btn.click();

            // vérifie
            const startEvt = await startP;
            expect(startEvt.detail).to.equal('saluer');

            const endEvt = await endP;
            expect(endEvt.detail).to.equal('saluer');
        },
        5000
    );

    it('désactive les boutons pendant l’animation', async () => {
        // déclenche le mode anim
        el.animating = true;
        await el.updateComplete;

        const allDisabled = Array.from(
            el.shadowRoot!.querySelectorAll('button')
        ).every((b: HTMLButtonElement) => b.disabled);

        expect(allDisabled).to.be.true;
    });
});
