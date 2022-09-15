require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

class RatioBot {

    constructor(targetId , userId) {
        this.targetId = targetId;
        this.userId = userId;
        this.Client = new TwitterApi({
            appKey: process.env.CONSUMER_KEY,
            appSecret: process.env.CONSUMER_SECRET,
            accessToken: process.env.ACCES_TOKEN,
            accessSecret: process.env.TOKEN_SECRET,
        });
        this.tweetsArray = [];
    }

    async replyRatio(tweetId){
        await this.Client.v2.reply('Ratio', tweetId)
        console.log('Le tweet a bien été Ratio');
    }


    async fetchTweetsByUser(nextToken) {
        const params = {
            max_results: 100,
            //exclude : 'replies'
        }
        if(nextToken) params.pagination_token = nextToken
        const res = await this.Client.v2.userTimeline(this.targetId, params)
        this.tweetsArray = this.tweetsArray.concat(res.data.data)
        if (res.meta.next_token) await this.fetchTweetsByUser(res.meta.next_token)
    }


    async ratioAll(){
        await this.fetchTweetsByUser(null)
        this.tweetsArray.forEach(items => this.Client.v2.replyRatio(items.id))
    }

    async likeAll(){
        await this.fetchTweetsByUser(null)
        this.tweetsArray.forEach(items => this.Client.v2.like(this.userId, items.id))
    }

    async logAll(){
        await this.fetchTweetsByUser(null)
        this.tweetsArray.forEach(items => console.log(items))
    }

    async tweet(text){
        await this.Client.v2.tweet(text)
    }

}

let x = new RatioBot('1118944139981279234');
x.logAll()