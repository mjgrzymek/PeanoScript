import { code2Stuff } from "./engine/compile";

const code = `
type divides<d extends N, n extends N> = {d2: N; p: d2 * d == n};
type nonTrivDivs<d extends N, n extends N> = d != 1 && d != n && divides<d, n>;
type isComposite<c extends N> = {d: N; p: d != 1 && d != c && divides<d, c>};
type isPrime<n extends N> = n != 1 && !isComposite<n>;
type lessEq<n extends N, m extends N> = {distance: N; differByDistance: n + distance == m};
type decidable<p extends Prop> = p || !p;


const addToZeroIsZero: (a: N) => (b: N) => (p: a + b == 0) => a == 0 = a => {
    return for(let ia = 0; let pa = b => p => eqRefl(0); ia < a; ia ++){
        return b => p => {
            const nope = succNotZero(ia + b)(ring(p));
            return neverElim(nope);
        }; 
    };
};

const mulTo1IsOne: (a : N) => (b : N) => (p : a * b == 1) => a == 1 = a => {
    return for(let ia = 0; let pa = b => p => ring(p); ia < a; ia ++){
        return b => for(let ib=0; let pb = p => neverElim(succNotZero(0)(ring(p))); ib < b; ib++){
           return p => {
               const iaIsZero = addToZeroIsZero(ia)(ib+ia*ib)(ring(p));
               return ring(iaIsZero);
            };
        };
    };
};

const lemma = (a : N) => (b : N) => (c: N) => (p: a * b == a * c + 1): a == 1 => {
    const xd = for(let bi = 0;
        let pb:  (cs: N) => (ps: a * bi == a * cs + 1) => a == 1 = cs => ps =>
            neverElim(succNotZero(a*cs)(ring(ps)));
        bi < b; bi ++)
        {
        break cs => for(let ci = 0;
            let pc = ps => mulTo1IsOne(a)(succ(bi))(ring(ps));
            ci < cs; ci ++){
            break ps => pb(ci)(ring(ps));
        };
    };
    return xd(c)(p);
};

const np1Coprime : (n : N) => (d: N) => (divs: d != 1 && divides<d, succ(n)>) => !divides<d, n> = 
    n => d => divs => dividesn => {
        const not1 = divs.left;
        const {d2, p} = divs.right;
        const {d2: d3, p: p3} = dividesn;
        type stuff<m extends N> = d2 * d == succ(m);
        const siup : d2*d == succ(d3*d) = replace<stuff>(n)(d3*d)(ring(p3))(p);
        const hej = lemma(d)(d2)(d3)(ring(siup));
        return not1(hej);
    };


const zeroOrNot : (x: N) => x == 0 || x != 0 = 
  x => for(let i =0; let p = {left: eqRefl(0)}; i < x; i++){
      continue {right: e => succNotZero(i)(e)};
  };
const zeroOrNotRev : (x: N) => 0 == x || 0 != x = x =>
  switch(zeroOrNot(x)){
  case {left: d}:
      break {left: eqSym(x)(0)(d)};
  case {right: d}:
      break {right: e => d(eqSym(0)(x)(e))};
  };

const equalityDecidable : (x : N) => (y : N) => x == y || x != y = 
  x => 
    for(
      let i = 0;
      let p: (y : N) => i == y || i != y = zeroOrNotRev;
      i < x; i++
    )
      continue y => 
        for(let j =0; let r = {right: succNotZero(i)}; j < y; j ++)
          switch(p(j)){
              case {left: d}:
                continue {left: ring(d)};
              case {right: d}:
                continue { right : (p) => d(ring(p)) };
          };

const nonZeroIsSucc: (n: N) => (nonZero: n != 0) => {prevN: N; isPrev: succ(prevN) ==  n} = 
    n => {
     return for(let in = 0; let pn = nonZero => neverElim(nonZero(eqRefl(0))); in < n; in ++){
         return nonZero => {prevN: in, isPrev: eqRefl(succ(in))};
     };
};


const multIncreasing : (n : N) => (m : N) => (nonZero: m != 0) => lessEq<n, n*m> =
   n => m => nonZero => {
    return for(let in = 0;
    let pn = {distance: 0, differByDistance: ring(eqRefl(0))};
    in < n; in ++){
        const {prevN: prevM, isPrev: isPrevM} = nonZeroIsSucc(m)(nonZero);
        const newDistance = succ(in) * prevM;
        const newDifferBy : succ(in)+newDistance == succ(in)*succ(prevM) = ring(eqRefl(0)) ;
        type wantedResult<k extends N> = succ(in) + newDistance == succ(in)*k;
        const replacedDifferBy = replace<wantedResult>(succ(prevM))(m)(isPrevM)(newDifferBy);
        return {distance: newDistance, differByDistance: replacedDifferBy};
    };
};


const divsImpliesLesser : (n : N) => (m : N) => (divs: m != 0 && divides<n, m>) => lessEq<n,m> = 
    n => m => divs => {
       // want to show n * d = m  =>  n <= m
       // we know a <= a * b  ( if b != 0)
       // so we want n <= n * d = m
       const {d2, p} = divs.right;
       const thing = multIncreasing(n)(d2)(d2Is0 => {
           type timesNisM<k extends N> = k*n == m;
           const mIs0 : m == 0 = ring(replace<timesNisM>(d2)(0)(d2Is0)(p));
           return (divs.left)(mIs0);
       });
       type moreThanN<k extends N> = lessEq<n, k>;
       const hi = replace<moreThanN>(n*d2)(m)(ring(p))(thing);
       return hi;
    };

const dividesTransitive: (a : N) => (b : N) => (c : N) =>
    (divAB: divides<a,b>) => (divBC : divides<b,c>) => divides<a,c> =
         a => b => c => divAB => divBC =>
    {
        const {d2, p} = divAB;
        const {d2: d3, p: p3} = divBC;
        const p4 = replaceAll(p3)(ring(p) as b == d2*a);
        return {d2: d2*d3, p: ring(p4)};    
    };

const twoIsPrime : isPrime<2> = (eq => succNotZero(0)(ring(eq))) && (composite => {
   const {d, p} = composite;
   const {d2, p: p2} = p.right;
   const dNot1 = p.left.left;
   const dNot2 = p.left.right;
   const dNot0 : d != 0 = eq => succNotZero(1)(ring(replaceAll(p2)(eq)));
   const d2Not0 : d2 != 0 = eq => succNotZero(1)(ring(replaceAll(p2)(eq)));
   const {prevN :prevD, isPrev : isPrevD} = nonZeroIsSucc(d)(dNot0);
   const revprev = ring(isPrevD) as d == succ(prevD);
   const changed1 = replaceAll(p2)(revprev);
   const {prevN : prevD2, isPrev: isPrevD2} = nonZeroIsSucc(d2)(d2Not0);
   const changed2 = replaceAll(changed1)(ring(isPrevD2) as d2 == succ(prevD2));
   const prevDNot0 : prevD != 0 = is0 => dNot1(ring(replaceAll(isPrevD)(is0)));
   const {prevN: prev2D, isPrev: isPrev2D} = nonZeroIsSucc(prevD)(prevDNot0);
   const changed3 = replaceAll(changed2)(ring(isPrev2D) as prevD == succ(prev2D));
   const thang = replaceAll(dNot2)(ring(isPrevD) as d == succ(prevD));
   const thang2 = replaceAll(thang)(ring(isPrev2D) as prevD == succ(prev2D));
   const prev2DNot0 : prev2D != 0 = is0 => thang2(ring(is0));
   const {prevN : prev3D, isPrev : isPrev3D} = nonZeroIsSucc(prev2D)(prev2DNot0);
   const changed4 = replaceAll(changed3)(ring(isPrev3D) as prev2D == succ(prev3D));
   // (1 + prevD2 ) * (3 + prev3D) == 2
   // 3 + prev3D + 3*prevD2 + prevD2*prev3D == 2
   const bad = succNotZero(prev3D+3*prevD2 + prevD2*prev3D)(ring(changed4));
   return bad;
});
const divsBelowDecidable : (a : N) => (b : N) => (max : N) => 
    decidable<{d: N; p: lessEq<d, max> && d*b == a}> = a => b => max => {
        const base : decidable<{d: N; p: lessEq<d, 0> && d*b == a}> = match(zeroOrNot(a)){
            case {left: is0}:
                type mul0bisK<k extends N> = 0 * b == k;
                const for0 : mul0bisK<0> = ring(eqRefl(0));
                const forA = replace<mul0bisK>(0)(a)(ring(is0))(for0);
                return {left: {d: 0, p: {distance: 0, differByDistance: ring(eqRefl(0))} && forA}};
            case {right: not0}:
                return {right: exists => {
                    const {d, p} = exists;
                    const {distance, differByDistance} = p.left;
                    const mulToA = p.right;
                    const dIs0 = addToZeroIsZero(d)(distance)(differByDistance);
                    const changed = replaceAll(mulToA)(dIs0);
                    const {prevN, isPrev} = nonZeroIsSucc(a)(not0);
                    const revPrev : a == succ(prevN) = ring(isPrev);
                    const changed2 = replaceAll(changed)(revPrev);
                    const nope = succNotZero(prevN)(ring(changed2));
                    return nope;
                }};
        };
        return for(let im = 0; let pm = base; im < max; im ++){
            switch(pm){
                case {left: exists}:
                    const {d, p} = exists;
                    const {distance, differByDistance} = p.left;
                    const divvy = p.right;
                    continue {left:
                        {d: d, p: {distance: distance+1, differByDistance: ring(differByDistance)}
                            && divvy} };
                case {right: notExists}:
                    match(equalityDecidable(succ(im) * b)(a)){
                          case {left: eq}:
                              continue {left: {d: succ(im),
                                  p: {distance:0, differByDistance: ring(eqRefl(0))} && eq}
                                  };
                          case {right: notEq}:
                              continue {right: exists => {
                                  const {d, p} = exists;
                                  const {distance, differByDistance} = p.left;
                                  const eqs = p.right;
                                  match(zeroOrNot(distance)){
                                      case {left: is0}:
                                          const dIsSim: d == succ(im) =
                                               ring(replaceAll(differByDistance)(is0));
                                          const badEqs = replaceAll(eqs)(dIsSim);
                                          continue notEq(badEqs);
                                      case {right: not0}:
                                          const {prevN, isPrev} = nonZeroIsSucc(distance)(not0);
                                          const revPrev : distance == succ(prevN) = ring(isPrev);
                                          const repl = replaceAll(differByDistance)(revPrev);
                                          const less : d + prevN == im = ring(repl);
                                          
                                          continue notExists({d: d, p:
                                              {distance: prevN, differByDistance: less} && eqs});
                                  };
                              }};
                    };
            };
        };
    };
    
const divsDecidable : (a : N) => (b : N) =>
    divides<a, b> || !divides<a, b> = a => b =>
    {
    const decBelowB = divsBelowDecidable(b)(a)(b);
    match(decBelowB){
        case {left: exists}:
            const {d, p} = exists;
            break {left: {d2: d, p: p.right}};
        case{right: notExists}:
            break {right: exists => {
                const {d2, p} = exists;
                match(zeroOrNot(a)){
                case {left: isZero}:
                    const newP = replaceAll(p)(isZero);
                    const OisB : 0 == b = ring(newP);
                    return notExists({d:0, p:
                        {distance: 0, differByDistance: ring(OisB)} && ring(OisB)});
                case{right:aNotZero}:
                    const c = multIncreasing(d2)(a)(aNotZero);
                    type d2IsLess<k extends N> = lessEq<d2, k>;
                    const swop = replace<d2IsLess>(d2*a)(b)(p)(c);
                    return notExists({d: d2, p : swop && p});
                };
            }};
    };   
};

const nonTrivDivsDec : (d : N) => (n : N) => decidable<nonTrivDivs<d, n>> = 
    d => n => {
    match(divsDecidable(d)(n)){
    case {left: l}:
        match(equalityDecidable(d)(1)){
        case {left: l2}: break {right: p => (p.left.left)(l2)};
        case {right: r2}:
            match(equalityDecidable(d)(n)){
            case {left: l3}: break {right: p => (p.left.right)(l3)};
            case {right: r3}: break {left: r2 && r3 && l};
            };
        };
    case {right: r}:
        break {right: is => r(is.right)};
    };
};

const lessify :
    (a : N) => (b : N) => (p: lessEq<a, succ(b)>  && a != succ(b)) => lessEq<a,b>
    = a => b => p => {
    
    const less = p.left;
    const notEq = p.right;
    const {distance, differByDistance} = less;
    const dNot0 : distance != 0 = is0 =>
        notEq(ring(replaceAll(differByDistance)(is0)));
    const {prevN, isPrev} = nonZeroIsSucc(distance)(dNot0);
    const revPrev : distance == succ(prevN) = ring(isPrev);
    const diff2 = replaceAll(differByDistance)(revPrev);
    return {distance: prevN, differByDistance: ring(diff2)};  
};

const compositeBelowDecidable : (n : N) =>
    (max : N) => decidable<{d: N; p: lessEq<d, max> && nonTrivDivs<d,n>}> = 
    n => max => {
    const base: decidable<{d: N; p: lessEq<d, 0> && nonTrivDivs<d,n>}> =
    {right: is => {
        const {d,p} = is;
        const {distance, differByDistance} = p.left;
        const dIs0 = addToZeroIsZero(d)(distance)(differByDistance);
        const {d2, p: p2} = p.right.right;
        const nIs0 : n == 0 = ring(replaceAll(p2)(dIs0));
        const bad1 = p.right.left.right;
        const bad2 = replaceAll(bad1)(nIs0);
        return bad2(dIs0);
    }};
    return for(let im = 0; let pm = base; im < max; im ++){
        match(pm){
        case{left: exists}:
            const {d, p} = exists;
            const lessThanIm = p.left;
            const rest = p.right;
            const {distance, differByDistance} = lessThanIm;
            const dist2p : d + succ(distance) == succ(im) = ring(differByDistance);
            break {left: {d: d, p:
                {distance: succ(distance), differByDistance: dist2p} &&  rest}};
        case{right: notExists}:
            match(nonTrivDivsDec(succ(im))(n)){
            case{left: divs}:
                break {left: {d: succ(im),
                    p: {distance:0 , differByDistance: ring(eqRefl(0))} && divs}};
            case{right: notDivs}:
                break {right: divs => {
                    const {d, p} = divs;
                    const less = p.left;
                    const good = p.right;
                    match(equalityDecidable(d)(succ(im))){
                    case {left: l}:
                        break notDivs(replaceAll(good)(l));
                    case {right: r}:
                       const isLess = lessify(d)(im)(less && r);
                       break notExists({d: d, p: isLess && good});
                    };
                }};
            };
        };
    };    
};

const compositeDecidable : (n: N) => decidable<isComposite<n>> =
   n => match(compositeBelowDecidable(n)(n)){
   case {left: l}: 
       const {d,p} = l;
       break {left: {d: d, p: p.right}};
   case {right: notBelow}:
       match(zeroOrNot(n)){
       case {left: is0}:
           break {left: {d: 2, p: (i0 => succNotZero(0)(ring(i0)))
               && (i2 => succNotZero(1)(replaceAll(i2)(is0)))
               && {d2: 0, p: ring(is0)}}};
       case {right: not0}:
           break {right: exists => {
           const {d,p} = exists;
           const hi = divsImpliesLesser(d)(n)(not0 && p.right);
           break notBelow({d: d, p: hi && p});
       }};
   };
};

const hasPrimeDivisorStrongInduction : (n : N) =>
    (belowN: N) =>
    (p: lessEq<belowN, n> && belowN != 1) =>
    {d: N; p: isPrime<d> && divides<d, belowN>} =
    n =>
{
    return for(let in=0;
       let pn = belowN => p => {
           const {distance, differByDistance} = p.left;
           const belowNis0 : 0 == belowN = ring(addToZeroIsZero(belowN)(distance)(differByDistance));
           const divs20: divides<2, 0> = {d2: 0, p: ring(eqRefl(0))};
           type divedBy2<k extends N> = divides<2, k>;
           return {d: 2, p: twoIsPrime && replace<divedBy2>(0)(belowN)(belowNis0)(divs20)};
       } ; in < n; in ++) {
       continue belowN => p => {
            return switch(equalityDecidable(belowN)(succ(in))){
                case {left: isEqual}:
                    break match(compositeDecidable(succ(in))){
                        case {left: sinComposite}:
                            const {d : sinDivisor, p : pSinDivisor} = sinComposite;
                            const sinDivisorLesser = divsImpliesLesser(sinDivisor)(succ(in))
                                (succNotZero(in) && pSinDivisor.right);
                            const {distance: distToSin, differByDistance: differToSin} = sinDivisorLesser;
                            const distNot0 : distToSin != 0 = is0 => {
                                const sindiIsSin = replaceAll(differToSin)(is0);
                                return (pSinDivisor.left.right)(ring(sindiIsSin));
                            };
                            const {prevN, isPrev} = nonZeroIsSucc(distToSin)(distNot0);
                            const SDiffersToSIn = replaceAll(differToSin)
                                (ring(isPrev) as distToSin == succ(prevN));
                            const recur = pn(sinDivisor)
                              ({distance: prevN, differByDistance: ring(SDiffersToSIn) }
                                  && pSinDivisor.left.left);
                            const {d: divisorDivisor, p: divDivP} = recur;
                            const divDivPrime = divDivP.left;
                            const divDivDivs = divDivP.right;
                            const divDivsSIn: divides<sinDivisor, succ(in)> = pSinDivisor.right;
                            const divDivDivsSIn: divides<divisorDivisor, succ(in)> =
                                dividesTransitive(divisorDivisor)(sinDivisor)(succ(in))
                                (divDivDivs)(divDivsSIn);
                            type dived<k extends N> = divides<divisorDivisor, k>;
                            const divDivDivsBelowN = replace<dived>(succ(in))(belowN)
                                (ring(isEqual))(divDivDivsSIn);
                            return {d: divisorDivisor, p: divDivPrime && divDivDivsBelowN};
                        case {right: inNonComposite}:
                            const not1 = replaceAll(p.right)(isEqual);
                            type isEqualToBelowN<k extends N> = 1 * k == belowN;
                            const isSelf: 1 * succ(in) == belowN
                                = replace<isEqualToBelowN>(belowN)(succ(in))
                                    (isEqual)(ring(eqRefl(0)));
                            return {d: succ(in), p: not1 && inNonComposite && {d2: 1, p: isSelf}};
                    };
                case {right: notEqual}:
                    // strong induction boilerplate
                    const {distance, differByDistance} = p.left;
                    const distanceNot0 : distance != 0 = is0 => {
                        return notEqual(ring(replaceAll(differByDistance)(is0)));
                    };
                    const {prevN: prevDist, isPrev} = nonZeroIsSucc(distance)(distanceNot0);
                    const differByPrev : belowN + prevDist == in =
                        ring(replaceAll(differByDistance)(ring(isPrev) as distance == succ(prevDist)));
                    
                    break pn(belowN)({distance: prevDist, differByDistance: differByPrev} && p.right);
            };
       };
    };
};

const hasPrimeDivisor : (n: N) => (not1: n != 1) => {d: N; p: isPrime<d> && divides<d, n> } = 
    n => not1 => {
        return hasPrimeDivisorStrongInduction(n)(n)({distance: 0, differByDistance: ring(eqRefl(0))} && not1);
    };
 
const preInfinitude
    : (n : N) => (nonzero: n != 0) => {p: N; new: isPrime<p> && !divides<p,n> }
    = n => nonzero => {
        const np1n1 = (is1: succ(n) === 1) => nonzero(ring(is1));
        const {d, p} = hasPrimeDivisor(succ(n))(np1n1);
        const dNotDivN = np1Coprime(n)(d)(p.left.left && p.right);
        const dIsPrime = p.left;
        return {p: d, new: dIsPrime && dNotDivN};
    };
const mulToZeroIsZero : (a : N) => (b : N) => (mulToZero: a*b ==0 ) => a==0 || b==0 =
    a => b => mulToZero => {
     match(zeroOrNot(a)){
     case {left: isZero}: break {left: isZero};
     case{right: notZero}: 
         match(zeroOrNot(b)){
         case {left: isZero}: break {right: isZero};
         case{right: notZeroB}:
             const {prevN: prevA, isPrev: isPrevA} = nonZeroIsSucc(a)(notZero);
             const {prevN: prevB, isPrev: isPrevB} = nonZeroIsSucc(b)(notZeroB);
             const isPrevARev: a == succ(prevA) = ring(isPrevA);
             const isPrevBRev: b == succ(prevB) = ring(isPrevB);
             const changed = replaceAll(mulToZero)(isPrevARev);
             const changed2 = replaceAll(changed)(isPrevBRev);
             const changed3: succ(prevA*prevB + prevA + prevB)  == 0 = ring(changed2);
             return neverElim(succNotZero(prevA*prevB + prevA + prevB)(changed3));
         };
     };
};

const factorial: (n : N) =>
    {factN: N;
    isDivisible: factN != 0 && ((d: N) => (less: lessEq<d, n> && d != 0) => divides<d, factN>)}
    =
    n => 
{
    return for(let i=0; let p={factN: 1, isDivisible: succNotZero(0) && (d => less => {
        const {distance, differByDistance} = less.left;
        const dIs0 = addToZeroIsZero(d)(distance)(differByDistance);
        return neverElim((less.right)(dIs0));
    })}; i<n; i++)
    {
        const {factN, isDivisible} = p;
        const factNot0 = isDivisible.left;
        const divvy = isDivisible.right;
        const new = factN*succ(i);
        const newNotZero: new != 0 = is0 => match(mulToZeroIsZero(factN)(succ(i))(is0))
        {
        case {left: fact0}: break factNot0(fact0);
        case{right: succi0}: break succNotZero(i)(succi0);
        };
        continue {factN: new, isDivisible: newNotZero && (d => less => {
            match(equalityDecidable(d)(succ(i))){
            case {left: isEqual}:
                const trol = eqMap((x: N) => factN*x)(isEqual);
                break {d2: factN, p: trol};
            case{right: notEqual}:
                const hi = lessify(d)(i)(less.left && notEqual);
                const hey = divvy(d)(hi && less.right);
                const {d2, p} = hey;
                const p2 = eqMap((x:N) => x*succ(i))(p);
                break {d2: d2 * succ(i), p: ring(p2)};
            }; 
        })};    
    };
};
const infinitude : (n : N) => {prime: N; good: isPrime<prime> && !lessEq<prime, n>}
    = n => {
    const {factN, isDivisible} = factorial(n);
    const factNot0 = isDivisible.left;
    const divi = isDivisible.right;
    const {p, new} = preInfinitude(factN)(factNot0);
    const pPrime = new.left;
    const pNotDivsFactN = new.right;
    // assume that p < n
    // then divi says p divides factN
    // which contradicts pNotDivsFactN
    const notless : !lessEq<p, n> = less => {
        const pNot0 : p != 0 = is0 => (pPrime.right)({d: 2,
            p: (is21 => succNotZero(0)(ring(is21)))
            && (is2 => succNotZero(1)(replaceAll(is2)(is0)))
            && {d2: 0, p: ring(is0)}});
        const divsFact = divi(p)(less && pNot0);
        return pNotDivsFactN(divsFact);
    };
    return {prime: p, good: new.left && notless};
};

return infinitude(9);
`;
const stuff = code2Stuff(code);
console.log(stuff.implRet);
