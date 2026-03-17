function makeRuleCard(CardID, RuleName, RuleText, Subrules)
{
this.CardID = CardID;
this.RuleName = RuleName;
this.RuleText = RuleText;
this.Subrules = Subrules; 
}


var RuleCard = new Array ("");

RuleCard[5270] = new makeRuleCard(2570, "Hit Outside", "Hit any blot outside your home board.", ["Hit in outfield rather than on your Bar.", "With direct hit from 24 or 8pt, play from Mid.<br>With hit from Mid, play from 24pt.<ul><li>With 24/20*, 6s are played to 14pt.</li><li>After 6x split, 65 hits on Bar and Ace.</li></ul>", "Forgo hitting on your Bar to make your 5pt."]); 
RuleCard[5271] = new makeRuleCard(2571, "Naturals", "31, 42, 53, 61, 65.<br>(If blocked: 61P 65: 13/7 13/8.)", ["Forgo making 3pt to hit loose on 5pt."]); 
RuleCard[5272] = new makeRuleCard(2572, "Hit Inside", "Hit loose on 5 and 4 points", ["With other checker: Hit again on 5, 4 (do not break 8pt), play from Mid, 24pt.", "After 43U, hit from Mid rather than expose additional blots.", "Forgo hitting on 4pt with 64."]); 
RuleCard[5273] = new makeRuleCard(2573, "Ace-X", "Slot aces after Slot or Down, otherwise Split. (Slot if ace-split is blocked by 64P.)", ["Hit twice inside with same checker only with 41 after ace-split.", "Treat 21$ as a virtual point: Split.", "Avoid direct shots in your outfield -- play from rear."]); 
RuleCard[5274] = new makeRuleCard(2574, "Six-X", "Split with 62, 63; With 64 hit on 3pt if possible, else Point.", ["Run after Slot or 61P.", "Run <em>past</em> Down.  62, 63: Run past fortified 8pt.", "Avoid direct shots in your outfield -- slot."]); 
RuleCard[5275] = new makeRuleCard(2575, "Others", "Down after Down or 2pt, otherwise Split.<br>(Z with 43; Down if S/Z are blocked.)", ["Slot 4pt with deuces after weak slots (51$, 62$). Play other number down.", "Hit 6/1* with 5 after 6x Split.  Split other checker.", "Hit on 3 and 2pts with 32, 43.<br>Split other checker (Down after 52S)."]);
RuleCard[5276] = new makeRuleCard(2576, "Aces", "8/7(2) 6/5(2)", ["24/22 6/5(2) after (non-6x) Split.", "6/4*(2), if possible."]); 
RuleCard[5277] = new makeRuleCard(2577, "Deuces", "13/11(2) 6/4(2)", ["24/22(2) 6/4(2) after Point or Down.<br>(13/11(2) 6/4(2) if blocked with 53P).", "Hit blots on 20 or 9, with 6/4(2)."]); 
RuleCard[5278] = new makeRuleCard(2578, "Treys", "24/21(2) 13/10(2).<br>(8/5(2) 6/3(2) if blocked by 42P.)", ["8/5(2) 6/3(2) if hitting on 5 or 3, or after Run.", "13/7*(2) after 6x Split.", "24/21(2) 8/5(2) after Slot or Down."]); 
RuleCard[5279] = new makeRuleCard(2579, "Fours", "24/20(2) 13/9(2).<br>(13/5(2) if blocked by 31P.)", ["Point on blots on 5 or 4 (with 24/20(2) if possible).", "Hit two blots (not on Ace) if possible.<br>Cover inner point or play 13/9(2) with your remaining moves, if any.", "Hit blot on 16 with 13/9(2)."]); 
RuleCard[5280] = new makeRuleCard(2580, "Fives", "8/3(2) 6/1(2) if hitting on 3 or 1, otherwise 13/3(2).", []); 
RuleCard[5281] = new makeRuleCard(2581, "Boxes", "24/18(2) 13/7(2).<br>(13/7(2) 8/2(2) if blocked by 61P.)", []);