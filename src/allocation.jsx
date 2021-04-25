import React, { useContext }                 from 'react';
import { AccountContext, currencyFormatter } from './utilities.jsx';
import './allocation.css';

// The percentage above which a portfolio is significantly out of balance
// `5` according to vanguard -- https://investornews.vanguard/rebalancing/
// `3` according to betterment, in order to trigger "sell/buy" rebalancing -- https://www.betterment.com/resources/portfolio-drift-rebalancing/
const DRIFT_THRESHOLD = 5;
{/* maybe just make it 1% since this is cash-flow strategy */ }


export function Allocation( { children, type, funds = null, targetAllocations = null } ) {
	if ( 'account' === type && null === targetAllocations && null === funds ) {
		( { funds, targetAllocations } = useContext( AccountContext ) );
	}

	const currentAllocation = getCurrentAllocation( funds, targetAllocations );

	const totalWithoutCash = Object.values( funds ).reduce( ( runningTotal, fund ) => {
		return runningTotal += fund.amount;
	}, 0 );

	return (
		<div className={ `allocation allocation-type-${ type }` }>
			{ children }

			{/* todo there's probably some npm project that'll change the input[tyep=number] into a better formatted version with commas, dollar sign, etc.*/ }

			{/* todo need buttons for editing the tags/groups*/ }

			{/*	todo need a way to set the ideal allocation*/ }

			{/* todo also test when cash = 0 */}

			<table>
				<thead>
					<tr>
						<th>Tag</th>
						<th>Target Percentage</th>
						<th>Actual Percentage</th>
						{/* maybe include columns for total amount and target amount?
						or is that only useful for debugging? */}
						<th>Drift</th>
						{/* todo maybe change ^ to be $50 (3.2), and then make below field action like `Buy $25`,
						 but that'd need the lazy optimum algorithm%*/}
						<th>Difference</th>
					</tr>
				</thead>

				<tbody>
					{ Object.keys( currentAllocation ).length && Object.entries( currentAllocation ).map( ( [ name, amount ], index ) => {
						const targetAllocation = targetAllocations[ name ];
						const actualAllocation = ( amount / totalWithoutCash * 100 ).toFixed( 1 );

						return (
							<TagRow
								key={ index }
								name={ name } /* + ` - $${amount}` } */
								target={ targetAllocation }
								actual={ actualAllocation }
								drift={ ( targetAllocation - actualAllocation ).toFixed( 1 ) }
								difference={ ( totalWithoutCash * targetAllocation / 100 ) - amount }
							/>
						);
					} ) }
				</tbody>
			</table>
		</div>
	);
}

// better name? todo
function getCurrentAllocation( funds, targetAllocation ) {
	// test when there's a fund that's not in the targetalloc and vice versa, including variation w/ porfoliotarget

	//const allTags           = Object.keys( targetAllocation );
	//allTags.map( key => currentAllocation[ key ] = 0 );
		// todo include the ones from funds? or just use the ones from the funds instead?
		// for total portfolio have to combine both funds(from all accounts) and portfoliotargetallocation

	const currentAllocation = {};

	funds.map( fund => {
		// lodash will do this for me? a

		fund.tags.map( tag => {
			if ( ! currentAllocation[ tag ] ) {
				currentAllocation[ tag ] = 0;
			}

			currentAllocation[ tag ] += parseFloat( fund.amount );
		} );
	} );

	// combine it w/ target alloc - wait, why? i thought i needed too, but then didn't
	// only needed for portolio alloc, not account alloc? no

	return currentAllocation;
}

function TagRow( { name, target, actual, drift, difference } ) {
	const className = drift >= DRIFT_THRESHOLD || drift <= - DRIFT_THRESHOLD ? 'drifted' : 'balanced';

	return (
		<tr>
			<td>{ name }</td>
			<td>
				<input
					className="target-allocation"
					type="number"
					value={ target }
					onChange={ value => value }
					min={ 0 }
					size={ 4 }
				/>
				%
			</td>
			<td className={ className }>{ actual }%</td>
			<td className={ className }>{ drift }%</td>
			<td className={ className }>{ currencyFormatter.format( difference ) }</td>
		</tr>
	);
}
