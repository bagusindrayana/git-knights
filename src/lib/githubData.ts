import axios from "axios";
import { Player, Item, ItemSkill } from "./models/player";
import items from "./data/item.json";
import skills from "./data/skill.json";

export function findItem(id: string): Item | undefined {
    const find = items.find((item: any) => item.id === id);
    if (!find) {
        return undefined;
    }
    return Item.fromJson(JSON.stringify(find));
}

export async function getUsername(userId: any) {

    const apiUrl = `https://api.github.com/user/${userId}`;
    const response = await axios.get(apiUrl);
    const user = response.data;

    const data = await getGithubData(user.login);
    data.playerData.id = userId;
    data.playerData.name = user.name;
    return data;
}

export async function getProfil(username: string) {
    try {
        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const user = response.data;

        return user;
    } catch (error) {
        return null;
    }
}

export async function getGithubData(username: string) {
    const query = `{
            user(login: "${username}") {
                name
                followers {
                    totalCount
                }
                pullRequests {
                    totalCount
                }
                issues {
                    totalCount
                }
            
                repositories(first: 100, ownerAffiliations: OWNER) {
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
                }
                followers {
                    totalCount
                }
                contributionsCollection {
                    totalCommitContributions
                }
            }
        }`;
    const apiToken =
        "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";
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

    let playerData = new Player({
        hp: 100,
        str: 85,
        spd: 60,
        atk: 90,
        def: 75,
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
    user.repositories.nodes.forEach((repo: any) => {
        if (repo.isFork) {
            totalFork++;
        } else {
            totalNotFork++;

            //languages
            repo.languages.edges.forEach((lang: any) => {
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
    totalXP =
        user.contributionsCollection.totalCommitContributions +
        (totalPR * 15) +
        (totalStars * 10) +
        (totalAcceptedPR * 20) +
        (totalClosedIssues * 5) +
        (user.followers.totalCount * 5) +
        (listLanguages.length * 5) +
        (user.repositories.totalCount * 2);
    playerData.exp = totalXP;


    playerData.hp = 75 + (user.repositories.totalCount * 10) + ((playerData.currentLevel() - 1) * 25);
    playerData.strength = 20 + (totalPR * 10) + ((playerData.currentLevel() - 1) * 5);
    playerData.attack = 30 + (listLanguages.length * 10) + ((playerData.currentLevel() - 1) * 15);
    playerData.speed = 15 + (totalAcceptedPR * 25) + ((playerData.currentLevel() - 1) * 25);
    playerData.defense = 25 + (totalClosedIssues * 15) + ((playerData.currentLevel() - 1) * 15);

    for (let i = 0; i < languages.length; i++) {
        let ni = findItem(languages[i].name.toLowerCase().replace(' ', '-'));
        if (ni) {
            ni.description = ni.name + " : " + ni.description;
            ni.name = languages[i].name;
            ni.quantity = languages[i].quantity;
            ni.color = languages[i].color;
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