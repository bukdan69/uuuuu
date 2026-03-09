-- Add CreditScore table for KUR loan eligibility assessment
CREATE TABLE "credit_scores" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL UNIQUE,
  "total_score" INTEGER NOT NULL DEFAULT 0,
  "business_duration_score" INTEGER NOT NULL DEFAULT 0,
  "revenue_score" INTEGER NOT NULL DEFAULT 0,
  "transaction_score" INTEGER NOT NULL DEFAULT 0,
  "rating_score" INTEGER NOT NULL DEFAULT 0,
  "kyc_score" INTEGER NOT NULL DEFAULT 0,
  "asset_score" INTEGER NOT NULL DEFAULT 0,
  "payment_history_score" INTEGER NOT NULL DEFAULT 0,
  "eligibility_status" TEXT NOT NULL DEFAULT 'not_eligible',
  "recommended_loan_amount" DECIMAL(15,2) DEFAULT 0,
  "risk_level" TEXT NOT NULL DEFAULT 'high',
  "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "credit_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "credit_scores_user_id_idx" ON "credit_scores"("user_id");
CREATE INDEX "credit_scores_eligibility_status_idx" ON "credit_scores"("eligibility_status");
CREATE INDEX "credit_scores_total_score_idx" ON "credit_scores"("total_score");
