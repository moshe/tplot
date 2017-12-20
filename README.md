## tplot
Tired of using `watch` for watching numbers in the terminal?  
e.g `watch "ls | wc -l"`  
Tired of calculating the decrease rate of items in queue over and over again?  
Trends? Throughput? Time left to zero?  

**tplot is the answer!**  
![alt text](https://github.com/moshe/tplot/blob/master/images/out4.gif?raw=true "Logo Title Text 1")

tplot is a nodejs cli that reads other commands stdout (from stdin / self invoke) and plots it in the terminal!  
In addition to the line chart you can see more stats about the series.

## stats:
tplot is trying to guess the slope of the line using [linear regression](https://en.wikipedia.org/wiki/Ordinary_least_squares) 

| name  | explain |
| ------------- | ------------- |
| Max | Maximum point (since launch) |
| Min | Minimum point (since launch) |
| Average | Average value of all points |
| Points collected | Amount of points collected (since launch) |
| Shape | Linear / non-linear |
| Throughput | If shape is linear presents the throughput based on line's slope|
| Time to ${program.goal} | The approximate time remained to the gaol (defaults to 0) |

## Examples:
#### Read numbers from stdin
`command | tplot`

#### Run command periodically and plot the output
`tplot -c 'echo $RANDOM'`

#### Plot the number of files in the directory
`plot -c 'ls|wc -l'`

#### Plot redis list length
`plot -c 'redis-cli llen events'`

## Usage:
```

  Usage: tplot [options]


  Options:

    -V, --version               output the version number
    -t, --title [title]         Set the title
    -c, --command [command]     Set command to watch and plot
    -i, --pollingInterval [n]   Set the polling interval for to command argument
    -p, --points [n]            Set the maximum number of points to show in the screen (default:100)
    -g, --goal [n]              If looking at an linear line, set the goal you wish the line will get (default:0)
    -r, --regressionPoints [n]  Set the numbers of points to collect in order to calculate the throughput (default:16)
    -h, --help                  output usage information
```

## Installation:
**via npm:**  
`npm install -g tplot`

**via docker:**
```
docker pull mosheza/tplot
docker run -it mosheza/tplot -c 'echo 1'
```

**via source:**
```
git@github.com:moshe/tplot.git
cd tplot
npm install --link
```
