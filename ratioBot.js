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

    replyRatio(tweetId){
        this.Client.v2.reply('Ratio', tweetId).then(res => {
            console.log('Le tweet a bien été Ratio');
        }).catch(err => console.log(err.data.title))
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


    ratioAll(){
        this.fetchTweetsByUser(null).then(res => {
            this.tweetsArray.forEach(items => this.Client.v2.replyRatio(items.id))
        }).catch(err => console.log(err.data.title))
    }

    likeAll(){
        this.fetchTweetsByUser(null).then(res => {
            this.tweetsArray.forEach(items => this.Client.v2.like(this.userId, items.id))
        }).catch(err => console.log(err.data.title))
    }

    logAll(){
        this.fetchTweetsByUser(null).then(res => {
            this.tweetsArray.forEach(items => console.log(items))
        }).catch(err => console.log(err.data.title))
    }

}
