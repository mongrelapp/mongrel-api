import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import StripeError from '../utils/stripeError.enum';
import { validateEmail } from '../utils';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
    });
  }

  public async createCustomer(name: string, email: string) {
    try {
      const validEmail = validateEmail(email)
        ? email
        : `${email}@${this.configService.get('SUFFIX_MONGREL_EMAIL')}`;
      const customers = await this.stripe.customers.list({
        email: validEmail,
        limit: 1,
      });

      if (customers?.data?.length > 0) {
        return customers.data[0];
      } else {
        return this.stripe.customers.create({
          name,
          email: validEmail,
        });
      }
    } catch (error) {
      if (error?.code === StripeError.ResourceMissing) {
        throw new BadRequestException('Creating customer failed!');
      }
      throw new InternalServerErrorException();
    }
  }

  public async charge(
    amount: number,
    paymentMethodId: string,
    customerId: string,
  ) {
    return this.stripe.paymentIntents.create({
      amount,
      customer: customerId,
      payment_method: paymentMethodId,
      currency: this.configService.get('STRIPE_CURRENCY'),
      off_session: true,
      confirm: true,
    });
  }

  public async attachCreditCard(paymentMethodId: string, customerId: string) {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method: paymentMethodId,
    });
  }

  public async setDefaultCreditCard(
    paymentMethodId: string,
    customerId: string,
  ) {
    try {
      return await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      if (error?.type === StripeError.InvalidRequest) {
        throw new BadRequestException('Wrong credit card chosen');
      }
      throw new InternalServerErrorException();
    }
  }

  public async listCreditCards(customerId: string) {
    return this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
  }

  public async createSubscription(priceId: string, customerId: string) {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        price: priceId,
        limit: 1,
      });

      if (subscriptions?.data?.length > 0) {
        return subscriptions.data[0];
      } else {
        return await this.stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: priceId,
            },
          ],
        });
      }
    } catch (error) {
      if (error?.code === StripeError.ResourceMissing) {
        throw new BadRequestException('Credit card not set up');
      }
      throw new InternalServerErrorException();
    }
  }

  public async listSubscriptions(priceId: string, customerId: string) {
    return this.stripe.subscriptions.list({
      customer: customerId,
      price: priceId,
      expand: ['data.latest_invoice', 'data.latest_invoice.payment_intent'],
    });
  }

  public async changeSubscription(
    customerPortalConfigId: string,
    customerId: string,
  ) {
    return await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      configuration: customerPortalConfigId,
    });
  }

  public async currentSubscription(customerId: string) {
    try {
      return await this.stripe.subscriptions.list({
        customer: customerId,
      });
    } catch (error) {
      if (error?.code === StripeError.ResourceMissing) {
        return { data: [] };
      }
      throw new InternalServerErrorException();
    }
  }
}
