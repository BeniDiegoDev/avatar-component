import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '../components/avatar-controller';

interface AvatarControllerArgs {
    src: string;
    width: number;
    height: number;
    autoplay?: boolean;
}

const meta: Meta<AvatarControllerArgs> = {
    title: 'Components/AvatarController',
    component: 'avatar-controller',
    args: {
        src: '/models/avatar.glb',
        width: 600,
        height: 600,
        autoplay: true,
    },
    argTypes: {
        src: {control: 'text', description: 'Chemin vers /models/avatar.glb'},
        width: {control: 'number', description: 'Largeur en px'},
        height: {control: 'number', description: 'Hauteur en px'},
        autoplay: {
            control: 'boolean',
            description: 'Joue la posture de base au chargement',
        },
    },
    parameters: {
        actions: {
            handles: ['animation-start', 'animation-end'],
        },
        docs: {
            description: {
                component: `
                            <avatar-controller>  
                            • Props : src, width, height, autoplay  
                            • Events : animation-start, animation-end (détail : nom de l’animation)
                            `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<AvatarControllerArgs>;

const renderAvatar = (args: AvatarControllerArgs) => html`
    <avatar-controller
            src="${args.src}"
            width="${args.width}"
            height="${args.height}"
            ?autoplay=${args.autoplay}
    ></avatar-controller>
`;

export const Default: Story = {
    render: renderAvatar,
    parameters: {
        docs: {
            description: {
                story: 'Idle en boucle + boutons prêts à l’emploi.',
            },
        },
    },
};

export const Controls: Story = {
    args: { src: '/models/avatar.glb', width: 800, height: 400, autoplay: false },
    render: renderAvatar,
    parameters: {
        docs: {
            description: {
                story: 'Modifiez URL, taille et autoplay à la volée.',
            },
        },
    },
};
