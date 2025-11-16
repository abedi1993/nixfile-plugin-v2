import {get} from "./fetch.js";
import {link} from "../__apiRoutes.js";
import {getToken} from "./getToken.js";

let capacityBar = null;
let expiredBar = null;

export function statistics() {
    jQuery(async function ($) {
        const nixfileCapacity = $(".nixfile-capacity");
        const nixfileExpired = $(".nixfile-expired");
        const capacityContainer = nixfileCapacity.find('div')[0];
        const expiredContainer = nixfileExpired.find('div')[0];
        $(capacityContainer).find('svg').remove();
        $(expiredContainer).find('svg').remove();
        capacityBar = new ProgressBar.Circle(capacityContainer, {
            color: '#00b894',
            strokeWidth: 6,
            trailWidth: 4,
            duration: 1400,
            easing: 'bounce',
            text: {
                autoStyleContainer: false
            },
            from: {color: '#00cec9', width: 8},
            to: {color: '#fecd28', width: 8},
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                const value = circle.value() * 100;
                $(capacityContainer).find('p').first().text(parseFloat(value).toFixed(1) + '%');
            }
        });
        expiredBar = new ProgressBar.Circle(expiredContainer, {
            color: '#00b894',
            strokeWidth: 6,
            trailWidth: 4,
            duration: 1400,
            easing: 'bounce',
            text: {
                autoStyleContainer: false
            },
            from: {color: '#00cec9', width: 8},
            to: {color: '#fecd28', width: 8},
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                const value = Math.round(circle.value() * 100);
                $(expiredContainer).find('p').first().text(value + '%');
            }
        });

        async function getStatistic() {
            const res = await get(`${link(1)}/upload-stats/?domain_id=${getToken}`);
            const uploaded = res.data.uploaded;
            const capacity = res.data.capacity;
            const percent = (uploaded * 100) / capacity;
            const dayPercent = res.data.duration
            console.log(dayPercent);
            capacityBar.animate(percent / 100);
            expiredBar.animate(dayPercent / 100);
        }

        await getStatistic();
    });
}
