// Pixel icons for the inside of the site (rank emblems, map node icons, the reward chest),
// in the same style as the valley sprites. Each comes as an <svg> holding a crisp <image>, so it
// slots in wherever the old line icons were and keeps their CSS sizing.
const PNG = {
    paw: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAA4UlEQVR42oWQsWrCYBSFv1+CRR+ho1MHBRGEjBI6uNo3SB8gD+DWPISjbyCCDyBOOlaqQzFFxKE4SGJpMCHL7+L9jYJ4xsPHPecevI6jD6OuPoy6ut1saM6651txFLL5mgOQJUfxEX+x2vIXXXzldRwdRyGbfcp4+a3kOsAy+CVJM2Y/a8MVfNfGe30mX8V3bXzXplgqG1g4S2KTNLtbJe8pp/qiJTZfJ45CAPqTuQIQTpGTRANmiI9BwPAzMJx1Cwsoeqs9sfuvaGlQuJ3xka4qvbfqWhZbrLYA9KZH8x/ACUOqnkWlB7E7AAAAAElFTkSuQmCC", 12, 10],
    compass: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAAqklEQVR42mNkgIJYJ/n/6R7/GNDBzB1MDIv3PWSE8VmQFRulH8XQkM5gzcDAIP8frinWSf7/kS7Z/98+PoLja/GuKPwjXbL/Y53k/zMwMDAw4TL5QV4ynG2UfpQh3eMfg72u/H8mBhIBC7qAS3ALAwODIsOetTVYNZBsA9PMHUwM52Zaowiim35upjVD9WImhoOX8YQUcgjZ60JCiIGBgYGRUMShmMzAwAAA/wZp3Nus1EQAAAAASUVORK5CYII=", 12, 10],
    bulb: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAyUlEQVR42mNggIKSnKT//7+f////UhQcl8Sa/WdAB9gUwnCelwJcA1NJTtL/7u5cBobb3QzYQFMYA4OHEUQDE8PHKzgVogMmfJIfzx1DVdyz+BRjafcdnAojJjEw7Dj3gBHVk7FmcE99WKDw/8MChf8wt8IAC4xx/6sWw+pHGRCOSB4DAwMDwyeWKgYGhgeYil++fMNw6MhpFNu+fPnKgNVkcXERBjsbUxTJc/vWo/BRHG5j7fPfwNadgYGBgeHQpiUMl66dRJEHABOFaHJaT5c9AAAAAElFTkSuQmCC", 11, 11],
    crown: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAHCAYAAAA8sqwkAAAAdElEQVR42mP4fynqf0ms2X8GKCiJNfuPS8zbRuc/CwMDA0N3qQoDAwPDfyQ2Q3epCsP1+9/+aypywcUYGBgYmGAMZEEYQFfMwMDAwPj/UtR/BiKBT9YliA3Xe1+jSFhPzEfhI8uTbAPL0R2HiVXP8OUjEwMAarAy5VMqh4QAAAAASUVORK5CYII=", 12, 7],
    trophy: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAAmklEQVR42mP8/6Tr/+fzmxnwgUvXHzBUL2ZiOHj5ISMTA4mAdA2lDfsYeA19iXIOAwMDA/Oxc3cav35ibvCJ9GD49eIWXsUooCTF4///J13/P222/f9ps+3/I12y/+115f/jdV9+kDZBxUzINiBLGKjyMMQ6YWpihCnubnBiQI8PbH5gYWBgYDh34h5DXe4LLA4QZvj09TOKCAB2ZlME3T8wIwAAAABJRU5ErkJggg==", 12, 10],
    palette: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAA7ElEQVR42pWPv4uBcRzHX189GxkMbDJQ6hl0E8XEU1em8wfIyHLrDZ5RFiuLTdn8AUoxWK67kvvRKUW6ns3gErcpX4svD6K8ps+n3u/Xp48AKGSSEqCYi3GOWesB0Oy+CwBRyCSlClozi2uUmgM6H2OhFXMxrJmF52uOB/iL+AB4GT0DUNGrAKR0F4t1UDq4E00NyqxQ5nMcAHFjS9zYHh9tfFJvT25fsIf73z9iv8p8OsTrcEzrbclgOhWaWeuRT4cOBb/Xif6UkAD8by4uCICsEZX2khlwA1D+XZ3YDwWAx4ewTOmuC6M9DLADB6xP5/fsZd0AAAAASUVORK5CYII=", 12, 10],
    gear_node: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAABoElEQVR42q2Uz0sCQRTHvyMeIoKIbkGYLbsUtZ6KDQ/BQt5KrEuXwEuHoP4p7yKy6GVXhDyIYOxByWAXU0/qIcLUY00Xd5h1f0jQu8y82Xmfne9784ZghV1cZqkzr5RyJGxvdBXo6vqW+ePRkLZf9EBgJOwkYXZ6fkNDYc5JHODka+ravLa+wUBKUvUAo36SFiM9OD5xwZSkCgB0MUJJqph8flCr/UwAgITlCACODvfZ/PXtHbbdZb5ezsMBeWCOhLvsPYMUNYN9E0UBAGDbXVR1DR3TIB6ZfNJ5aUXNgF7OAwA2t7ZdQEGSAYDFdUyDRIOkOSBeRmx3h2bSKSZ1AQQAzGdTGsE/WigskZD/BItWSjkyHg0pAHz/UAiSDNuOQxQFZNIpV14eHp9Q1AwM+j0AQMusM9DAahDfaipJlSWavxpOZQf9HrpW21NN4gdif+v3ENuLu3zeloEkCFTVNVe1eAC/3jLrGFgN4mqnZq1AnFbhrgQNCKSCJLtAnieoWSsQvteCrGMaZD6bUh7kezVWgfjqLa+tDIxJZzQMwNsvaUnS7bf7X9UAAAAASUVORK5CYII=", 19, 19],
    chest_lid: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAMCAYAAAADFL+5AAABDElEQVR42mNkQAKxLub/GRgYGNK9VBnWv7ViYGBgYAgUPsZACUA2p3vlJQYGBgaGjScvMcLkWZAtT/dSZaAlCDQXh7L0/sMcwcTAwMDgb65Hc8vRHeKko/afgYGBgcXfXO9/oLk4w50HL1FV8UIoDHFSAZI5dx+/hgtbq3IxvP+m/J+FgYGBYc+Zmxj63olB4uvlq5sU2Y/PHEEuDgYWSLyIY0iuegShXUzUKXIAsjnIIcDAwMCgKA5NAwMJWNBdhQDKDAwMDAy45YkFCHPuv3yH6QBsggwMDAwMYhAKl/ziVTkMn89vhvOz2h+SZQ7LOzEvAokIuzyy5fjUEZJnefL4AVXiklxzBjwRAgDqY2Lduym+NgAAAABJRU5ErkJggg==", 32, 12],
    chest_base: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAwUlEQVR42mNckOf6nwELWPVImYGBgYEhTO4uhlx8mSs2LQwLu3bjNefu49cY8iwMZILP5zej8Lftv8vAwKBNsjlMDBQAj8LrDB6F1ykxgjIHMDAwMOzo1xw4B1BqOQMDAwPLnjM3scuIQRIPNvl4BldonKMCrGbhMYeBgYGBRVFcCKvEO2jewCZfl7uMgYFBDENcURy/OfdfvqN+GqAUjDqABVu8QBIPhMIpTywgYA5ZiZAUMJoICQFGPWOP/yM6BACAl0C1AK4ovAAAAABJRU5ErkJggg==", 32, 16],
};

export function pixelIcon(name, className = "px-icon") {
    const [src, w, h] = PNG[name];
    const s = Math.max(w, h);
    return `<svg class="${className}" viewBox="0 0 ${s} ${s}" aria-hidden="true" style="fill:none;stroke:none"><image href="${src}" x="${(s - w) / 2}" y="${(s - h) / 2}" width="${w}" height="${h}" style="image-rendering:pixelated"/></svg>`;
}

// The reward chest: the lid is its own group so the opening animation can tip it back.
export function pixelChest() {
    const [lid, lw, lh] = PNG.chest_lid, [base, bw, bh] = PNG.chest_base;
    return `<svg class="chest" viewBox="0 0 ${bw} ${lh + bh - 3}" aria-hidden="true">
    <g class="chest-base"><image href="${base}" x="0" y="${lh - 3}" width="${bw}" height="${bh}" style="image-rendering:pixelated"/></g>
    <g class="chest-lid"><image href="${lid}" x="${(bw - lw) / 2}" y="0" width="${lw}" height="${lh}" style="image-rendering:pixelated"/></g></svg>`;
}
