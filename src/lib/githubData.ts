import axios from "axios";
import { Player, Item, ItemSkill } from "./models/player";
import items from "./data/item.json";
import skills from "./data/skill.json";
import { GITHUB_API_TOKEN } from '$env/static/private';

export function findItem(id: string): Item | undefined {
    const find = items.find((item: any) => item.id === id);
    if (!find) {
        return undefined;
    }
    return Item.fromJson(JSON.stringify(find));
}

export async function getUsername(userId: any) {
    const apiToken = GITHUB_API_TOKEN;
    const apiUrl = `https://api.github.com/user/${userId}`;
    const response = await axios.get(apiUrl,{
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    });
    const user = response.data;

    const data = await getGithubData(user.login);
    data.playerData.id = userId;
    data.playerData.name = user.name;
    return data;
}

export async function getProfil(username: string) {
    const apiToken = GITHUB_API_TOKEN;
    const apiUrl = `https://api.github.com/users/${username}`;
    const response = await axios.get(apiUrl,{
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    });
    const user = response.data;

    return user;
}

async function queryRepository(username: string, after?: string){
    const query = `
    {
  user(login: "${username}") {
    name
    repositories(first: 100, ownerAffiliations: OWNER, after: "${after}") {
      totalCount
      nodes {
        stargazerCount
        forkCount
        isFork
        issues(states: CLOSED) {
          totalCount
        }
        pullRequests(states: MERGED,first:100) {
          totalCount
          nodes {
            authorAssociation
            author {
              login
            }
            closedAt
            mergedAt
            createdAt
          }
          
        }
        languages(first: 100) {
          edges {
            size
            node {
              name
            	color
            }
          }
         
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
    
  }
}
`;

const apiToken = GITHUB_API_TOKEN;
    const url = "https://api.github.com/graphql";

    const response = await axios.post(
        url,
        { query: query },
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        },
    );

    const user = response.data.data.user;

    return user.repositories;
}

async function queryData(username: string) {
    const query = `{
            user(login: "${username}") {
                login
                name
                avatarUrl
                followers {
                    totalCount
                }
                pullRequests {
                    totalCount
                }
                issues {
                    totalCount
                }
            
                repositories(first: 100, ownerAffiliations: OWNER, after: null) {
                    totalCount
                    nodes {
                        stargazerCount
                        forkCount
                        isFork
                        issues(states: CLOSED) {
                            totalCount
                        }
                        pullRequests(states: MERGED,first:100) {
                        totalCount
                            nodes {
                                authorAssociation
                                author {
                                    login
                                }
                                closedAt
                                mergedAt
                                createdAt
                            }
                        }
                        languages(first: 10,orderBy: {field: SIZE, direction: DESC}) {
                            edges {
                                size
                                node {
                                name
                                    color
                                }
                            }
                        }
                    }
                    pageInfo {
                        endCursor
                        startCursor
                        hasNextPage
                        hasPreviousPage
                    }
                }
                followers {
                    totalCount
                }
                contributionsCollection {
                    totalCommitContributions
                }
            }
        }`;
    const apiToken = GITHUB_API_TOKEN;
    const url = "https://api.github.com/graphql";

    const response = await axios.post(
        url,
        { query: query },
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        },
    );
    const user = response.data.data.user;

    let listLanguages: string[] = [];

    const imageUrl = user?.avatarUrl;
    //get user id from imageUrl
    const userId = imageUrl
        ?.split("/")
    [imageUrl.split("/").length - 1].split("?")[0];


    let playerData = new Player({
        hp: 100,
        str: 85,
        spd: 60,
        atk: 90,
        def: 75,
        profile:{
            name: user.name ?? username,
            id: userId
        }
    });
    let languages: any[] = [];
    const items: Item[] = [];

    //total repositories is fork
    let totalFork = 0;
    let totalNotFork = 0;
    let totalAcceptedPR = 0;
    let totalPR = 0;
    let totalClosedIssues = 0;
    let totalStars = 0;
    let totalXP = 0;
    let totalSize = 0;
    user.repositories.nodes.forEach((repo: any) => {
        if (repo.isFork) {
            totalFork++;
        } else {
            totalNotFork++;

            //languages
            repo.languages.edges.forEach((lang: any) => {
                totalSize += lang.size;
                if (!listLanguages.includes(lang.node.name)) {
                    listLanguages.push(lang.node.name);
                    languages.push({
                        name: lang.node.name.replaceAll("+", "p").replace("#", "sharp").replace(".", "-"),
                        color: lang.node.color,
                        size: lang.size,
                        quantity: 1,
                    });
                } else {
                    languages = languages.map((l) => {
                        if (l.name === lang.node.name.replaceAll("+", "p").replace("#", "sharp").replace(".", "-")) {
                            l.size += lang.size;
                            l.quantity++;
                        }
                        return l;
                    });
                }
            });
        }

        //total accepted PR merge by user
        totalAcceptedPR += repo.pullRequests.nodes.filter(
            (pr: any) => pr.authorAssociation === "CONTRIBUTOR",
        ).length;
        //total PR
        totalPR += repo.pullRequests.totalCount;

        //total issues
        totalClosedIssues += repo.issues.totalCount;

        //total stars
        totalStars += repo.stargazerCount;

    });

    let next:boolean = user.repositories.pageInfo.hasNextPage;
    let after:string = user.repositories.pageInfo.endCursor;
    while (next) {
        const repos = await queryRepository(username, after)
        next = repos.pageInfo.hasNextPage;
        after = repos.pageInfo.endCursor;

        repos.nodes.forEach((repo: any) => {
            if (repo.isFork) {
                totalFork++;
            } else {
                totalNotFork++;
    
                //languages
                repo.languages.edges.forEach((lang: any) => {
                    totalSize += lang.size;
                    if (!listLanguages.includes(lang.node.name)) {
                        listLanguages.push(lang.node.name);
                        languages.push({
                            name: lang.node.name.replaceAll("+", "p").replace("#", "sharp").replace(".", "-"),
                            color: lang.node.color,
                            size: lang.size,
                            quantity: 1,
                        });
                    } else {
                        languages = languages.map((l) => {
                            if (l.name === lang.node.name.replaceAll("+", "p").replace("#", "sharp").replace(".", "-")) {
                                l.size += lang.size;
                                l.quantity++;
                            }
                            return l;
                        });
                    }
                });
            }
    
            //total accepted PR merge by user
            totalAcceptedPR += repo.pullRequests.nodes.filter(
                (pr: any) => pr.authorAssociation === "CONTRIBUTOR",
            ).length;
            //total PR
            totalPR += repo.pullRequests.totalCount;
    
            //total issues
            totalClosedIssues += repo.issues.totalCount;
    
            //total stars
            totalStars += repo.stargazerCount;
    
        });
    }
    totalXP =
        user.contributionsCollection.totalCommitContributions +
        (totalPR * 15) +
        (totalStars * 10) +
        (totalAcceptedPR * 20) +
        (totalClosedIssues * 5) +
        (user.followers.totalCount * 5) +
        (listLanguages.length * 5) +
        (totalNotFork * 2) +
        Math.round((totalSize/100000));
    playerData.exp = totalXP;


    playerData.hp = 75 + (totalNotFork * 100) + ((playerData.currentLevel() - 1) * 50);
    playerData.strength = 75 + (totalPR * 25) + ((playerData.currentLevel() - 1) * 5);
    playerData.attack = 75 + (listLanguages.length * 15) + ((playerData.currentLevel() - 1) * 50);
    playerData.speed = 75 + (totalAcceptedPR * 50) + ((playerData.currentLevel() - 1) * 50);
    playerData.defense = 75 + (totalClosedIssues * 35) + ((playerData.currentLevel() - 1) * 50);

    for (let i = 0; i < languages.length; i++) {
        let ni = findItem(languages[i].name.toLowerCase().replace(' ', '-'));
        if (ni) {
            ni.description = ni.name + " : " + ni.description;
            ni.name = languages[i].name;
            ni.quantity = languages[i].quantity;
            ni.color = languages[i].color;
            ni.exp = languages[i].size;
            const listSkill = skills.find((skill: any) => skill.id === ni.id)?.skills || [];
            ni.skills = listSkill.map((skill: any) => { return ItemSkill.fromJson(JSON.stringify(skill)) });
            items.push(ni);
        } else {
            const ni = new Item({ id: languages[i].name.toString(), name: languages[i].name, description: "", quantity: languages[i].quantity, color: languages[i].color });
            const listSkill = skills.find((skill: any) => skill.id === ni.id)?.skills || [];
            ni.skills = listSkill.map((skill: any) => { return ItemSkill.fromJson(JSON.stringify(skill)) });
            items.push(ni);
        }


    }

    playerData.items = items;

    return {
        playerData: playerData,
        languages: languages,
    };
}

export async function getGithubData(username: string) {
    return await queryData(username);
}