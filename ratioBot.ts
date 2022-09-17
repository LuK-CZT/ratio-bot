require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');


interface Params {
    max_results: number,
    exclude : string,
    pagination_token ?: string
}

class RatioBot {

    targetId : string
    userId : string
    Client : any
    tweetsArray : any[] 

    constructor(targetId : string , userId : string) {
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

    async replyRatio(tweetId : string){
        await this.Client.v2.reply('Ratio', tweetId)
        console.log('Le tweet a bien été Ratio');
    }


    async fetchTweetsByUser(nextToken : string | null , getNextPage: boolean, numberOfResults : number) {
        const params : Params = {
            max_results: numberOfResults,
            exclude : 'replies'
        }

        if(nextToken) params.pagination_token = nextToken
        const res = await this.Client.v2.userTimeline(this.targetId, params)
        this.tweetsArray = this.tweetsArray.concat(res.data.data)
        if (res.meta.next_token && getNextPage) await this.fetchTweetsByUser(res.meta.next_token , true, 100)
    }

    async getLast10tweets(){
        const res = await this.Client.v2.userTimeline(this.targetId, {max_results : 10, exclude : 'replies'})
        this.tweetsArray = res.data.data
    }


    async ratioAll(){
        await this.fetchTweetsByUser(null , true, 100)
        this.tweetsArray.forEach(items => this.Client.v2.replyRatio(items.id))
    }

    async likeAll(){
        await this.fetchTweetsByUser(null, true, 100)
        this.tweetsArray.forEach(items => this.Client.v2.like(this.userId, items.id))
    }

    async logAll(){
        await this.fetchTweetsByUser(null, true, 100)
        this.tweetsArray.forEach(items => console.log(items))
    }

    async tweet(text : string){
        await this.Client.v2.tweet(text)
    }

    async ratioOnPost(){
        await this.getLast10tweets()
        let lastTweet = this.tweetsArray[0];
        console.log(lastTweet);
        setInterval(async () => {
            await this.getLast10tweets()
            console.log(this.tweetsArray[0])
            if(lastTweet.id === this.tweetsArray[0].id){
                console.log('Pas de nouveaux tweets');
            } else {
                this.replyRatio(this.tweetsArray[0].id)
                this.tweetsArray = [];
            }
            
        }, 5000 )
    }

}

