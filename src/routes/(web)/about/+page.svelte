<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        
    });
</script>

<svelte:head>
    <title>GitKnight</title>
</svelte:head>


<main>
    

    <section class="py-20 bg-black text-white">
        <div class="container mx-auto text-center flex justify-center flex-col items-center">
            <h2 class="text-6xl font-bold" style="margin-bottom: 80px;">
                How the game work?
            </h2>
            <img src="./images/flow.png" alt="">
        </div>
    </section>

    <section class="py-20 bg-purple-200">
        <div class="container relative mx-auto w-full md:w-1/2 flex flex-col items-center p-16">
            <div class=" text-center w-full">
                <h3 class="text-4xl font-bold mb-12 text-purple-800">
                    Collecting Data
                </h3>
                <p class="text-2xl">
                    The game wiill collect your github activity (dont worry, we only collect public data from your profile)
                </p>
                <p class="text-2xl">
                    Data we collect such as :
                </p>
            </div>
            
            <div class="text-2xl text-start mx-3 block w-full mt-4" >
                <ul class="list-disc">
                    <li>
                        Github ID
                    </li>
                    <li>
                        Github Username
                    </li>
                    <li>
                        Profile Name
                    </li>
                    <li>
                        Total Follower
                    </li>
                    <li>
                        Total Pull Request
                    </li>
                    <li>
                        Total Issue
                    </li>
                    <li>
                        Total Repositories
                    </li>
                    <li>
                        Total Commmit
                    </li>
                    <li>
                        Language Your Use
                    </li>
                </ul>
              
            </div>

            <div class=" text-center w-full">
                <h3 class="text-4xl font-bold mb-12 text-purple-800">
                    Formula
                </h3>
                <p class="text-2xl">
                    After that, the data will be converted into game statistics with the following formula:
                </p>
               
            </div>
            <div class="text-2xl text-start mx-3 block w-full mt-4" >
                <ul class="list-disc">
                    <li>
                        <b>EXP</b> : total commit contributor + (total PR x 15) + (total star x 10) + (total accept PR x 20) + (total closed issue x 5) + (total follower x 5) + (total language x 5) + (total repositories x 2)
                    </li>
                    <li>
                        <b>HP</b> : 75 + (total repositories x 100) + ((player level - 1) x 50)
                    </li>
                    <li>
                        <b>STR</b> : 75 + (total PR x 25) + ((player level - 1) x 5)
                    </li>
                    <li>
                        <b>ATK</b> : 75 + (total language x 15) + ((player level - 1) x 50)
                    </li>
                    <li>
                        <b>SPD</b> : 75 + (total accepted PR x 50) + ((player level - 1) x 50)
                    </li>
                    <li>
                        <b>DEF</b> : 75 + (total closed issue x 35) + ((player level - 1) x 50)
                    </li>
                    <li>
                        <b>Level Progression</b> : 1000 x level ( 1 + level / 1000)
                    </li>
                    
                </ul>
              
            </div>

        </div>
    </section>
</main>
