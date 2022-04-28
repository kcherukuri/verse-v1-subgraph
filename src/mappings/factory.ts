import { PairFactory, Exchange } from '../../generated/schema'
import { Exchange as ExchangeTemplate } from '../../generated/templates'
import { Hyperobject as HyperobjectContract } from '../../generated/templates/Exchange/Hyperobject'

import { PairCreated } from '../../generated/PairFactory/PairFactory'
import { PAIR_FACTORY_ADDRESS, ONE_BI, RESERVE_RATIO, ZERO_BI } from './helpers'

export function handlePairCreated(event: PairCreated): void {
  // load factory (create if first exchange)
  let pairFactory = PairFactory.load(PAIR_FACTORY_ADDRESS)
  if (pairFactory === null) {
    pairFactory = new PairFactory(PAIR_FACTORY_ADDRESS);
    pairFactory.totalVolumeETH = ZERO_BI
    pairFactory.pairCount = ZERO_BI
    pairFactory.txCount = ZERO_BI
  }
  pairFactory.pairCount = pairFactory.pairCount.plus(ONE_BI)
  pairFactory.save();
  

  // create new exchange instance
  let exchange = new Exchange(event.params.exchangeAddress.toHexString()) as Exchange
  exchange.name = event.params.name;
  exchange.symbol = event.params.symbol;
  exchange.deployer = event.address;
  exchange.creator = event.params.creator;
  exchange.hyperobject = event.params.hyperobjectAddress
  exchange.poolBalance = ZERO_BI;
  exchange.totalSupply = ZERO_BI;
  exchange.txCount = ZERO_BI;
  exchange.volumeETH = ZERO_BI;

  // get hyperobject contract from chain
  let hyperobjectContract = HyperobjectContract.bind(event.params.hyperobjectAddress)
  let tokenURI = hyperobjectContract.baseURI()
  exchange.tokenURI = tokenURI

  // create the tracked contract based on the template
  ExchangeTemplate.create(event.params.exchangeAddress)

  // save updated values
  exchange.save()
  pairFactory.save()
}