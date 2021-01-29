//app.js

/**
 * Calculate the top 10 matches for a set of profiles, provided by input.json, and shows it on terminal and stores it in output.js
 *
 * @param none
 */

var solution = function () {
  console.log("yeah");
  var prettyjson = require("prettyjson");

  var importance_points = [0, 1, 10, 50, 250]; //Values for importance level
  var s = 0; //Variable for answered questions (S)

  var results = [];

  var fs = require("fs");

  var ranking = [];
  var a_profile_base_importance_points = 0;
  var a_profile_importance_points = 0;
  var b_profile_base_importance_points = 0;
  var b_profile_importance_points = 0;
  var a_match_satisfaction = 0;
  var b_match_satisfaction = 0;

  //First, let's read the input.json file
  fs.readFile("input.json", "utf8", function (err, contents) {
    var data = JSON.parse(contents);

    //Loop iteration through the profiles data.
    //Loop 1: This loop will serve as Profile A (in order to contrast Profile A against Profile B)
    for (a_profile of data.profiles) {
      var id = a_profile["id"];
      ranking = [];

      //Loop 2: This loop will serve as Profile B (in order to contrast Profile B against Profile A)
      for (b_profile of data.profiles) {
        //It's important to avoid the same profile.
        if (a_profile["id"] == b_profile["id"]) continue;

        s = 0;
        a_profile_base_importance_points = 0;
        a_profile_importance_points = 0;
        b_profile_base_importance_points = 0;
        b_profile_importance_points = 0;

        //Now, we need to find the set of questions that both Profile A and Profile B anwered

        //Loop 3: Iteration through the answers provided by Profile B
        for (b_answer of b_profile["answers"]) {
          var b_questionId = b_answer["questionId"];
          var b_importance = b_answer["importance"];

          //Loop 4: Iteration through the answers provided by Profile A
          for (a_answer of a_profile["answers"]) {
            var a_questionId = a_answer["questionId"];
            var a_importance = a_answer["importance"];

            //Check if both profiles answered the same question
            if (a_questionId == b_questionId) {
              /*
                                We need to gather the maximum importance points obtainable by the answers of the profile being confronted
                                This will be used later in the match calculation
                            */
              a_profile_base_importance_points +=
                importance_points[a_importance]; //Maximum importance points obtainables by Profile B
              b_profile_base_importance_points +=
                importance_points[b_importance]; //Maximum importance points obtainables by Profile A

              //Also, lets consider the amount of answered questions
              s++;

              /*
                                Now, let's face the core of the calculation: Measuring the satisfaction score provided by the answers of each Profile.
                                We got to find if the answer of Profile B is an acceptable answer under the interests of Profile A and viceversa.
                            */

              //Profile A: Profile B answer vs Profile A acceptable answers
              if (
                a_answer["acceptableAnswers"].indexOf(b_answer["answer"]) !== -1
              ) {
                /*
                                    if a Profile states that any answer is acceptable, then the question is "irrelevant" (importance zero)                   We know this by checking the number of acceptable answers (4 possible answers). Then, 4 acceptable answers means the question is "irrelevant". Otherwise, the importance of the question will be met and has to be taken in count (accumulated).
                                */
                if (a_answer["acceptableAnswers"].length < 4) {
                  a_profile_importance_points +=
                    importance_points[a_importance];
                }
              }

              //Profile B: Profile A answer vs Profile B acceptable answers
              if (
                b_answer["acceptableAnswers"].indexOf(a_answer["answer"]) !== -1
              ) {
                /*
                                    if a Profile states that any answer is acceptable, then the question is "irrelevant" (importance zero)                   We know this by checking the number of acceptable answers (4 possible answers). Then, 4 acceptable answers means the question is "irrelevant". Otherwise, the importance of the question will be met and has to be taken in count (accumulated).
                                */
                if (b_answer["acceptableAnswers"].length < 4) {
                  b_profile_importance_points +=
                    importance_points[b_importance];
                }
              }
            }
          }
        }

        //Now, we calculate the match score for Profile A vs Profile B
        a_match_satisfaction =
          a_profile_importance_points / a_profile_base_importance_points;

        //Also, we calculate the match score for Profile B vs Profile A
        b_match_satisfaction =
          b_profile_importance_points / b_profile_base_importance_points;

        //In order to calculate the True Match percentage, we need to obtain the Reasonable Margin of Error
        var margin_error = 1 / s;

        //Now, the True Match calculation:
        var true_match =
          Math.sqrt(a_match_satisfaction * b_match_satisfaction) - margin_error;

        //If True Match is below zero, set the True Match value to zero (negative values will not be allowed)
        if (true_match < 0) true_match = 0;
        true_match = true_match.toFixed(2);

        //Then, we store in the pair Id-Score of every profile contrasted to Profile A.
        ranking[ranking.length] = {
          profileId: b_profile["id"],
          score: true_match,
        };
      }

      /*
                Let's sort the matching profiles by their score in descending order and just take the top ten matches.
            */
      ranking.sort(function (a, b) {
        if (a.score < b.score) {
          return 1;
        }
        if (a.score > b.score) {
          return -1;
        }
        return 0;
      });

      ranking = ranking.slice(0, 10);

      //Finally, we store the Profile A
      results[results.length] = {
        profileId: a_profile["id"],
        matches: ranking,
      };
    }

    results = { results: results };

    //Printing the results on the terminal in a readable format
    console.log(prettyjson.render(results));

    //You can check also the "output.json" file
    fs.writeFileSync("output.json", JSON.stringify(results, null, 2));
  });
};

exports.solution = solution;
