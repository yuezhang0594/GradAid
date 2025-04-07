import { mutation, query } from './_generated/server';
import { profileUpdateValidator } from './validators';

export const updateProfile = mutation({
    args: profileUpdateValidator,
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('Called storeUser without authentication present');
        }

        const user = await ctx.db.query('users')
            .filter(q => q.eq('_id', identity.subject)).unique();

        if (!user) {
            throw new Error('User not found');
        }

        const profile = await ctx.db.query('profiles')
            .filter(q => q.eq(q.field('userId'), user._id)).unique();

        if (profile) {
            await ctx.db.patch(profile._id, args);
            return profile._id;
        }

        return await ctx.db.insert('profiles', {
             ...args, 
             userId: user._id, 
             profileComplete: args.profileComplete ?? false });
    },
});