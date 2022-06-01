const { MongoClient } = require('mongodb')

async function main(){

    const uri = "mongodb+srv://Illia:200453638@cluster0.knhim.mongodb.net/?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try{
        await client.connect();

       //adding the new fields to the collection manually
        await createMultipleListings(client, [
            {
                songTitle: "Jumpsuit",
                albumName: "Trench",
                artistName: "Twenty One Pilots",
                songTrackNumber: "1",
                songLength: "3:59",
                songReleaseDate: "Oct 4, 2018"
            },
            {
                songTitle: "Sweater Weather",
                albumName: "I Love You",
                artistName: "The Neighbourhood",
                songTrackNumber: "4",
                songLength: "4:00"
            },
            {
                songTitle: "Sparks",
                albumName: "Parachutes",
                artistName: "Coldplay",
                songTrackNumber: "4",
                songLength: "3:47"
            },
            {
                songTitle: "Welcome to the Black Parade",
                albumName: "The Black Parade",
                artistName: "My Chemical Romance",
                songTrackNumber: "5",
                songLength: "5:11"
            },
            {
                songTitle: "Karma Police",
                albumName: "OK Computer",
                artistName: "Radiohead",
                songTrackNumber: "6",
                songLength: "4:22"
            }
        ]) 

        //call our function to find the listing by title
        await findOneListingByTitle(client, "Jumpsuit");

        // Update an existing record using the upsert functionality
        await upsertListingByTitle(client, "Test Song", { songTitle: "renamed", albumName: "Trench", 
        artistName: "Twenty One Pilots", songTrackNumber: "1",songLength: "3:59"});

        // //Delete listings 
        await deleteListingsScrapedBeforeDate(client, new Date("1112-02-15"));

    } catch (e){
        console.error(e);
    }finally{
        await client.close();
    }
    
}

main().catch(console.error);

async function deleteListingsScrapedBeforeDate(client, date){
    const result = await client.db("music_assign1").collection("songs").deleteMany({"songReleaseDate": {$lt: date}});
    console.log(`${result.deletedCount} document was/were deleted`);
}

async function upsertListingByTitle(client, titleOfListing, updatedListing){
    const result = await client.db("music_assign1").collection("songs").updateOne({songTitle: titleOfListing}, { $set: updatedListing}, {upsert: true});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);

    if(result.upsertedCount > 0){
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    }else 
        console.log(` ${result.upsertedId} document(s) was/were updated`);
}

async function findOneListingByTitle(client, titleOfListing){
    const result = await client.db("music_assign1").collection("songs").findOne({songTitle: titleOfListing});

    if (result){
        console.log(`Found a listing in the collection with the title '${titleOfListing}'`);
        console.log(result);
    }else{
        console.log(`No listings found with the name '${titleOfListing}'`);
    }
}

//Create a multiple data entry in a collection
async function createMultipleListings(client, newListing){

      //create a constant variable to show the path of the collection
    const result = await client.db("music_assign1").collection("songs").insertMany(newListing);

    //print our id of the collection
    console.log(`${result.insertedCount }New listing created with the following id(s):`);
    console.log(result.insertedIds)
}

//  create single listing

// async function createListing(client, newListing){

//     const result = await client.db("music_assign1").collection("songs").insertOne(newListing);

//     console.log(`New listing created with the following id: ${result.insertedId}`);
// }

async function listDatabases(client){
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:")
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`);
    })
}