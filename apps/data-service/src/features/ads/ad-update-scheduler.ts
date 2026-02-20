import { DurableObject } from "cloudflare:workers";

export interface FacebookAdvertiserPages {
	pageId: string;
	processed?: boolean;
	lastUpdate?: Date;
	pageName?: string;
}

const SECONDS = 1000 // milliseconds
 const HOURS = 60 * 60 * SECONDS
 const DAYS = 24 * HOURS

export class AdDataUpdateScheduler extends DurableObject<Env> {
		facebookAdvertiserPages: FacebookAdvertiserPages | undefined;
		constructor(ctx: DurableObjectState, env: Env) {
			super(ctx, env);
			ctx.blockConcurrencyWhile(async () => {
				this.facebookAdvertiserPages = await ctx.storage.get<FacebookAdvertiserPages>("facebook_advertiser_pages");
			});
		}


	async showStatus() {
			const pages = await this.ctx.storage.list();
			return pages;
		}


	async addPageIds(pageIds: string[]) {
	  // todo - parse data to invalidate shitty strings
		for (const pageId of pageIds) {
		 const existing = await this.ctx.storage.get(pageId);
        if (!existing) {
            await this.ctx.storage.put(pageId, {
                pageId,
                processed: false,
                lastUpdate: new Date(),
            });
        }
		}


    // If there is no alarm currently set, set one for 30 seconds from now
    let currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm) {
      await this.ctx.storage.setAlarm(Date.now() + 30 * SECONDS);
    }
	}


	async alarm() {
		const allPages = await this.ctx.storage.list<FacebookAdvertiserPages>();
		const unprocessed: FacebookAdvertiserPages[] = [];
		const LIMIT = 2

		for (const [, page] of allPages) {
			if (page && page.processed === false && unprocessed.length < LIMIT) {
				unprocessed.push(page);
			}
		}

		for (const page of unprocessed) {
			try {
				await this.env.FETCH_AD_WORKFLOW.create({
					params: { pageId: page.pageId },
				});
				await this.ctx.storage.put(page.pageId, {
					...page,
					processed: true,
					lastUpdate: new Date(),
				});
			} catch (e) {
				console.error(`Failed to process pageId ${page.pageId}:`, e);
			}
		}

	 // If there is no alarm currently set, set one for 30 seconds from now
    let currentAlarm = await this.ctx.storage.getAlarm();
    if (!currentAlarm && unprocessed.length >= 2) {
      await this.ctx.storage.setAlarm(Date.now() + 1 * HOURS);
    }

	}

}
